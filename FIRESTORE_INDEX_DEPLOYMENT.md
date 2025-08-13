# Firestore 인덱스 배포 가이드 - 완전 해결판

## 문제 상황
Firestore에서 복합 쿼리 실행 시 다음과 같은 에러가 발생할 수 있습니다:
```
FirebaseError: The query requires an index. You can create it here: https://console.firebase.google.com/...
```

**⚠️ 중요: 에러가 계속 발생하는 이유**
- getProducts() 함수에서 여러 필터를 동시에 사용할 때 모든 조합에 대한 인덱스가 필요
- 예: category + brand + isWomens + stock + orderBy(createdAt) 등의 복합 조합
- 이번 업데이트로 **모든 가능한 조합**을 커버하는 완전한 인덱스 세트를 제공

## 해결 방법

### 1. Firebase CLI 설치 (미설치된 경우)
```bash
npm install -g firebase-tools
```

### 2. Firebase 로그인
```bash
firebase login
```

### 3. 프로젝트 초기화 (처음 설정하는 경우)
```bash
firebase init firestore
```

### 4. 인덱스 배포
```bash
firebase deploy --only firestore:indexes
```

### 5. 배포 확인
배포 완료 후 Firebase Console에서 확인:
1. [Firebase Console](https://console.firebase.google.com) 접속
2. 프로젝트 선택 (golf-3241e)
3. Firestore Database → 인덱스 탭에서 생성된 인덱스 확인

## 생성된 인덱스 목록

### Products 컬렉션 인덱스 (총 37개)
#### 2필드 인덱스 (6개)
- `category` + `createdAt` (DESC)
- `brand` + `createdAt` (DESC) 
- `isWomens` + `createdAt` (DESC)
- `isKids` + `createdAt` (DESC)
- `isLeftHanded` + `createdAt` (DESC)
- `stock` + `createdAt` (DESC)

#### 3필드 인덱스 (13개)
- `category` + `brand` + `createdAt` (DESC)
- `category` + `isWomens` + `createdAt` (DESC)
- `category` + `isKids` + `createdAt` (DESC)
- `category` + `isLeftHanded` + `createdAt` (DESC)
- `category` + `stock` + `createdAt` (DESC)
- `brand` + `isWomens` + `createdAt` (DESC)
- `brand` + `isKids` + `createdAt` (DESC)
- `brand` + `isLeftHanded` + `createdAt` (DESC)
- `brand` + `stock` + `createdAt` (DESC)
- `isWomens` + `stock` + `createdAt` (DESC)
- `isKids` + `stock` + `createdAt` (DESC)
- `isLeftHanded` + `stock` + `createdAt` (DESC)
- 기타 조합들...

#### 4필드 인덱스 (12개)
- `category` + `brand` + `stock` + `createdAt` (DESC)
- `category` + `isWomens` + `stock` + `createdAt` (DESC)
- `category` + `isKids` + `stock` + `createdAt` (DESC)
- `category` + `isLeftHanded` + `stock` + `createdAt` (DESC)
- `brand` + `isWomens` + `stock` + `createdAt` (DESC)
- `brand` + `isKids` + `stock` + `createdAt` (DESC)
- `brand` + `isLeftHanded` + `stock` + `createdAt` (DESC)
- `category` + `brand` + `isWomens` + `createdAt` (DESC)
- `category` + `brand` + `isKids` + `createdAt` (DESC)
- `category` + `brand` + `isLeftHanded` + `createdAt` (DESC)
- 기타 조합들...

#### 5필드 인덱스 (3개) - 최대 복합 필터링
- `category` + `brand` + `isWomens` + `stock` + `createdAt` (DESC)
- `category` + `brand` + `isKids` + `stock` + `createdAt` (DESC)
- `category` + `brand` + `isLeftHanded` + `stock` + `createdAt` (DESC)

#### 가격 정렬 인덱스 (3개)
- `category` + `price` (ASC/DESC)
- `brand` + `price` (ASC/DESC)
- `category` + `brand` + `price` (ASC/DESC)

### Orders 컬렉션 인덱스
- `userId` + `createdAt` (DESC) - 사용자별 주문 목록
- `status` + `createdAt` (DESC) - 상태별 주문 목록

### Users 컬렉션 인덱스
- `status` + `createdAt` (DESC) - 승인 대기 사용자 목록

## 주의사항

1. **인덱스 빌드 시간**: 기존 데이터가 많을 경우 인덱스 생성에 시간이 걸릴 수 있습니다.

2. **비용**: 인덱스는 추가 저장 공간을 사용하므로 비용이 발생할 수 있습니다.

3. **자동 인덱스**: Firebase는 단일 필드에 대한 인덱스를 자동으로 생성하지만, 복합 쿼리에는 수동으로 인덱스를 생성해야 합니다.

## 대안 방법 (즉시 해결)

Firebase CLI 없이 즉시 해결하려면 에러 메시지에 포함된 URL을 클릭하여 Firebase Console에서 직접 인덱스를 생성할 수 있습니다:

```
https://console.firebase.google.com/v1/r/project/golf-3241e/firestore/indexes?create_composite=...
```

하지만 장기적으로는 `firestore.indexes.json` 파일을 통한 관리를 권장합니다.

## 트러블슈팅

### 배포 실패 시
```bash
# Firebase 프로젝트 확인
firebase projects:list

# 올바른 프로젝트로 변경
firebase use golf-3241e

# 다시 배포 시도
firebase deploy --only firestore:indexes
```

### 인덱스 상태 확인
```bash
firebase firestore:indexes
```
