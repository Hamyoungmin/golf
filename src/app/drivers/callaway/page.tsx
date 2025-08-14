import ProductList from '@/components/ProductList';

const callawayDrivers = [
  { id: 'callaway-driver-1', name: 'PARADYM 10.5도 Project X HZRDUS Smoke IM10 60', price: '가격문의', image: null },
  { id: 'callaway-driver-2', name: 'ROGUE ST MAX 10.5도 Fujikura VENTUS Blue 6 R', price: '가격문의', image: null },
  { id: 'callaway-driver-3', name: 'EPIC MAX LS 9도 Project X HZRDUS Smoke IM10', price: '가격문의', image: null },
  { id: 'callaway-driver-4', name: 'EPIC SPEED 9도 Diamana 50 for Callaway S', price: '가격문의', image: null },
  { id: 'callaway-driver-5', name: 'EPIC SPEED 10.5도 Diamana 50 for Callaway SR', price: '가격문의', image: null },
  { id: 'callaway-driver-6', name: '에픽 스피드 10.5 SR Diamana 50', price: '가격문의', image: null },
  { id: 'callaway-driver-7', name: '에픽 맥스 FAST 10.5 R FAST Driver Speeder Evolution', price: '가격문의', image: null },
  { id: 'callaway-driver-8', name: '에픽 플래시 STAR 9.5 S Speeder Evolution for CW', price: '가격문의', image: null },
  { id: 'callaway-driver-9', name: '캘러웨이 에픽 플래시 9.5 Speeder Evolution for CW S', price: '가격문의', image: null },
  { id: 'callaway-driver-10', name: 'ROGUE STAR 10.5도 Speeder EVOLUTION R', price: '가격문의', image: null },
  { id: 'callaway-driver-11', name: '로그 ST MAX FAST 10.5 S Speeder NX 40', price: '가격문의', image: null },
  { id: 'callaway-driver-12', name: 'XR16 10.5도 SR', price: '가격문의', image: null }
];

export default function CallawayDrivers() {
  return (
    <ProductList 
      title="캘러웨이 드라이버"
      subtitle="| CALLAWAY DRIVERS"
      products={callawayDrivers}
      totalCount={callawayDrivers.length}
      category="캘러웨이 드라이버"
    />
  );
}
