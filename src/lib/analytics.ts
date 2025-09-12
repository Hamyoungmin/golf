import { 
  db,
  collection, 
  query, 
  getDocs, 
  doc,
  getDoc,
  setDoc,
  updateDoc,
  orderBy,
  serverTimestamp
} from './firebase';
import { getAllOrders } from './orders';
import { getProducts } from './products';

// 방문자 통계 타입 정의
export interface VisitorStats {
  totalVisitors: number;
  uniqueVisitors: number;
  pageViews: number;
  date: Date;
}

// 매출 통계 타입 정의
export interface SalesAnalytics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  conversionRate: number;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
    growthRate: number;
  }>;
  categoryStats: Array<{
    category: string;
    sales: number;
    revenue: number;
    percentage: number;
  }>;
  dailyStats: Array<{
    date: string;
    revenue: number;
    orders: number;
    visitors: number;
  }>;
  monthlyStats: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
}

// 방문자 추가/업데이트
export async function trackVisitor(sessionId: string, userId?: string): Promise<void> {
  try {
    if (!db) {
      throw new Error('Firestore가 초기화되지 않았습니다');
    }
    
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식
    const visitorRef = doc(db, 'visitors', `${today}_${sessionId}`);
    
    await setDoc(visitorRef, {
      sessionId,
      userId: userId || null,
      date: new Date(),
      lastVisit: serverTimestamp(),
      pageViews: 1
    }, { merge: true });

    // 일별 방문자 통계 업데이트
    await updateDailyVisitorStats(today);
  } catch (error) {
    console.error('방문자 추적 오류:', error);
  }
}

// 페이지뷰 증가
export async function incrementPageView(sessionId: string): Promise<void> {
  try {
    if (!db) {
      throw new Error('Firestore가 초기화되지 않았습니다');
    }
    
    const today = new Date().toISOString().split('T')[0];
    const visitorRef = doc(db, 'visitors', `${today}_${sessionId}`);
    
    const visitorDoc = await getDoc(visitorRef);
    if (visitorDoc.exists()) {
      const currentPageViews = visitorDoc.data().pageViews || 0;
      await updateDoc(visitorRef, {
        pageViews: currentPageViews + 1,
        lastVisit: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('페이지뷰 증가 오류:', error);
  }
}

// 일별 방문자 통계 업데이트
async function updateDailyVisitorStats(date: string): Promise<void> {
  try {
    if (!db) {
      throw new Error('Firestore가 초기화되지 않았습니다');
    }
    
    // 해당 날짜의 모든 방문자 조회 - 단순화
    const visitorsQuery = query(
      collection(db, 'visitors'),
      orderBy('date', 'desc')
    );
    
    const visitorsSnapshot = await getDocs(visitorsQuery);
    
    // 클라이언트에서 날짜 필터링
    const startOfDay = new Date(date + 'T00:00:00');
    const endOfDay = new Date(date + 'T23:59:59');
    
    const filteredVisitors = visitorsSnapshot.docs.filter(doc => {
      const docDate = doc.data().date?.toDate();
      if (!docDate) return false;
      return docDate >= startOfDay && docDate <= endOfDay;
    });
    
    const totalVisitors = filteredVisitors.length;
    
    // 고유 방문자 수 계산 (sessionId 기준)
    const uniqueSessions = new Set();
    let totalPageViews = 0;
    
    filteredVisitors.forEach(doc => {
      const data = doc.data();
      uniqueSessions.add(data.sessionId);
      totalPageViews += data.pageViews || 1;
    });
    
    // 일별 통계 저장
    const statsRef = doc(db, 'dailyStats', date);
    await setDoc(statsRef, {
      date: new Date(date),
      totalVisitors,
      uniqueVisitors: uniqueSessions.size,
      pageViews: totalPageViews,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('일별 방문자 통계 업데이트 오류:', error);
  }
}

// 실시간 매출 통계 계산
export async function calculateSalesAnalytics(
  startDate?: Date,
  endDate?: Date
): Promise<SalesAnalytics> {
  try {
    // 주문 데이터 가져오기
    const orders = await getAllOrders();
    const products = await getProducts();
    
    // 날짜 필터링
    const filteredOrders = orders.filter(order => {
      if (!startDate && !endDate) return true;
      const orderDate = new Date(order.createdAt);
      if (startDate && orderDate < startDate) return false;
      if (endDate && orderDate > endDate) return false;
      return order.status === 'paid' || order.status === 'delivered'; // 결제 완료된 주문만
    });
    
    // 기본 통계 계산
    const totalOrders = filteredOrders.length;
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // 방문자 수 조회하여 전환율 계산
    const conversionRate = await calculateConversionRate(startDate, endDate, totalOrders);
    
    // 상품별 매출 분석
    const productSales = new Map<string, { sales: number; revenue: number; name: string }>();
    
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        if (productSales.has(item.productId)) {
          const current = productSales.get(item.productId)!;
          current.sales += item.quantity;
          current.revenue += item.totalPrice;
        } else {
          const product = products.find(p => p.id === item.productId);
          productSales.set(item.productId, {
            sales: item.quantity,
            revenue: item.totalPrice,
            name: product?.name || item.productName
          });
        }
      });
    });
    
    // 베스트셀러 상품 (매출액 기준 상위 10개)
    const topProducts = Array.from(productSales.entries())
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 10)
      .map(([id, data]) => ({
        id,
        name: data.name,
        sales: data.sales,
        revenue: data.revenue,
        growthRate: Math.random() * 30 - 10 // 임시로 랜덤 성장률 (나중에 이전 기간 대비 계산)
      }));
    
    // 카테고리별 매출 분석
    const categoryRevenue = new Map<string, { sales: number; revenue: number }>();
    
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        const category = product?.category || 'others';
        
        if (categoryRevenue.has(category)) {
          const current = categoryRevenue.get(category)!;
          current.sales += item.quantity;
          current.revenue += item.totalPrice;
        } else {
          categoryRevenue.set(category, {
            sales: item.quantity,
            revenue: item.totalPrice
          });
        }
      });
    });
    
    const categoryStats = Array.from(categoryRevenue.entries())
      .map(([category, data]) => ({
        category: getCategoryLabel(category),
        sales: data.sales,
        revenue: data.revenue,
        percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0
      }))
      .sort((a, b) => b.revenue - a.revenue);
    
    // 일별 통계 계산 (최근 30일)
    const dailyStats = await calculateDailyStats(30);
    
    // 월별 통계 계산 (최근 12개월)
    const monthlyStats = await calculateMonthlyStats(12);
    
    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      conversionRate,
      topProducts,
      categoryStats,
      dailyStats,
      monthlyStats
    };
  } catch (error) {
    console.error('매출 통계 계산 오류:', error);
    // 오류 시 기본값 반환
    return {
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      conversionRate: 0,
      topProducts: [],
      categoryStats: [],
      dailyStats: [],
      monthlyStats: []
    };
  }
}

// 전환율 계산
async function calculateConversionRate(
  startDate?: Date,
  endDate?: Date,
  totalOrders: number = 0
): Promise<number> {
  try {
    if (!startDate) {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30); // 기본 30일
    }
    if (!endDate) {
      endDate = new Date();
    }
    
    if (!db) {
      throw new Error('Firestore가 초기화되지 않았습니다');
    }
    
    // 기간 내 일별 통계 조회 - 단순화
    const statsQuery = query(
      collection(db, 'dailyStats'),
      orderBy('date', 'desc')
    );
    
    const statsSnapshot = await getDocs(statsQuery);
    
    // 클라이언트에서 날짜 필터링
    const filteredStats = statsSnapshot.docs.filter(doc => {
      const docDate = doc.data().date?.toDate();
      if (!docDate || !startDate || !endDate) return false;
      return docDate >= startDate && docDate <= endDate;
    });
    
    const totalVisitors = filteredStats.reduce((sum, doc) => {
      return sum + (doc.data().uniqueVisitors || 0);
    }, 0);
    
    return totalVisitors > 0 ? (totalOrders / totalVisitors) * 100 : 0;
  } catch (error) {
    console.error('전환율 계산 오류:', error);
    return 0;
  }
}

// 일별 통계 계산
async function calculateDailyStats(days: number): Promise<Array<{
  date: string;
  revenue: number;
  orders: number;
  visitors: number;
}>> {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    const orders = await getAllOrders();
    const dailyMap = new Map<string, { revenue: number; orders: number }>();
    
    // 주문 데이터 집계
    orders
      .filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= startDate && orderDate <= endDate && 
               (order.status === 'paid' || order.status === 'delivered');
      })
      .forEach(order => {
        const dateKey = order.createdAt.toISOString().split('T')[0];
        if (dailyMap.has(dateKey)) {
          const current = dailyMap.get(dateKey)!;
          current.revenue += order.totalAmount;
          current.orders += 1;
        } else {
          dailyMap.set(dateKey, {
            revenue: order.totalAmount,
            orders: 1
          });
        }
      });
    
    if (!db) {
      throw new Error('Firestore가 초기화되지 않았습니다');
    }
    
    // 방문자 데이터 조회 - 단순화
    const statsQuery = query(
      collection(db, 'dailyStats'),
      orderBy('date', 'desc')
    );
    
    const statsSnapshot = await getDocs(statsQuery);
    const visitorMap = new Map<string, number>();
    
    // 클라이언트에서 날짜 필터링
    statsSnapshot.docs
      .filter(doc => {
        const docDate = doc.data().date?.toDate();
        if (!docDate) return false;
        return docDate >= startDate && docDate <= endDate;
      })
      .forEach(doc => {
        const data = doc.data();
        const dateKey = data.date.toDate().toISOString().split('T')[0];
        visitorMap.set(dateKey, data.uniqueVisitors || 0);
      });
    
    // 결과 배열 생성
    const result: Array<{ date: string; revenue: number; orders: number; visitors: number }> = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      
      const orderData = dailyMap.get(dateKey);
      result.push({
        date: dateKey,
        revenue: orderData?.revenue || 0,
        orders: orderData?.orders || 0,
        visitors: visitorMap.get(dateKey) || 0
      });
    }
    
    return result.reverse(); // 최신순으로 정렬
  } catch (error) {
    console.error('일별 통계 계산 오류:', error);
    return [];
  }
}

// 월별 통계 계산
async function calculateMonthlyStats(months: number): Promise<Array<{
  month: string;
  revenue: number;
  orders: number;
}>> {
  try {
    const orders = await getAllOrders();
    const monthlyMap = new Map<string, { revenue: number; orders: number }>();
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - months);
    
    orders
      .filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= startDate && orderDate <= endDate && 
               (order.status === 'paid' || order.status === 'delivered');
      })
      .forEach(order => {
        const monthKey = order.createdAt.toISOString().substring(0, 7); // YYYY-MM 형식
        if (monthlyMap.has(monthKey)) {
          const current = monthlyMap.get(monthKey)!;
          current.revenue += order.totalAmount;
          current.orders += 1;
        } else {
          monthlyMap.set(monthKey, {
            revenue: order.totalAmount,
            orders: 1
          });
        }
      });
    
    // 결과 배열 생성
    const result: Array<{ month: string; revenue: number; orders: number }> = [];
    
    for (let i = 0; i < months; i++) {
      const date = new Date(startDate);
      date.setMonth(date.getMonth() + i);
      const monthKey = date.toISOString().substring(0, 7);
      const monthLabel = `${date.getMonth() + 1}월`;
      
      const orderData = monthlyMap.get(monthKey);
      result.push({
        month: monthLabel,
        revenue: orderData?.revenue || 0,
        orders: orderData?.orders || 0
      });
    }
    
    return result;
  } catch (error) {
    console.error('월별 통계 계산 오류:', error);
    return [];
  }
}

// 카테고리 라벨 변환
function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    drivers: '드라이버',
    woods: '우드',
    irons: '아이언',
    wedges: '웨지',
    putters: '퍼터',
    utilities: '유틸리티',
    others: '기타'
  };
  return labels[category] || category;
}

// 주문 생성 시 자동 통계 업데이트 트리거
export async function onOrderCreated(orderId: string): Promise<void> {
  try {
    // 주문 생성 시 실행할 추가 작업들
    console.log(`주문 생성 알림: ${orderId}`);
    
    // 필요시 실시간 통계 캐시 무효화 또는 업데이트
    // 예: Redis 캐시 삭제, 대시보드 웹소켓 알림 등
    
    // 일별 통계 업데이트
    const today = new Date().toISOString().split('T')[0];
    await updateDailyOrderStats(today);
  } catch (error) {
    console.error('주문 생성 후 통계 업데이트 오류:', error);
  }
}

// 일별 주문 통계 업데이트
async function updateDailyOrderStats(date: string): Promise<void> {
  try {
    const startOfDay = new Date(date + 'T00:00:00');
    const endOfDay = new Date(date + 'T23:59:59');
    
    const orders = await getAllOrders();
    const todayOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startOfDay && orderDate <= endOfDay;
    });
    
    const paidOrders = todayOrders.filter(order => 
      order.status === 'paid' || order.status === 'delivered'
    );
    
    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    if (!db) {
      throw new Error('Firestore가 초기화되지 않았습니다');
    }
    
    // 일별 통계 업데이트
    const statsRef = doc(db, 'dailyStats', date);
    await setDoc(statsRef, {
      totalOrders: todayOrders.length,
      paidOrders: paidOrders.length,
      totalRevenue,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('일별 주문 통계 업데이트 오류:', error);
  }
}
