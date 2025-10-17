# RLS (Row Level Security) 문제 분석

## 🔍 일반적인 RLS 문제들

### 1. **사용자 관련 테이블 RLS 문제**

- `users` 테이블: 사용자는 자신의 정보만 조회/수정 가능해야 함
- `accounts`, `sessions` 테이블: NextAuth.js 관련 테이블의 RLS 정책
- `verification_tokens` 테이블: 인증 토큰 관련 RLS

### 2. **주문 및 결제 관련 RLS 문제**

- `orders` 테이블: 사용자는 자신의 주문만 조회 가능
- `order_items` 테이블: 주문 아이템 접근 제어
- `payments` 테이블: 결제 정보 보안 (민감한 정보)
- `refunds` 테이블: 환불 정보 접근 제어

### 3. **장바구니 관련 RLS 문제**

- `cart` 테이블: 사용자는 자신의 장바구니만 접근 가능
- `cart_items` 테이블: 장바구니 아이템 접근 제어

### 4. **상품 관련 RLS 문제**

- `products` 테이블: 일반적으로 모든 사용자가 조회 가능 (공개)
- `product_variants` 테이블: 상품 변형 정보
- `inventory` 테이블: 재고 정보 (관리자만 접근 가능할 수도 있음)
- `product_images` 테이블: 상품 이미지

### 5. **리뷰 및 쿠폰 관련 RLS 문제**

- `reviews` 테이블: 사용자는 자신의 리뷰만 수정 가능
- `coupons` 테이블: 쿠폰 정보 접근 제어
- `coupon_usage` 테이블: 쿠폰 사용 기록

## 🚨 예상되는 RLS 문제들

### 1. **RLS 정책 누락**

```sql
-- 예시: users 테이블 RLS 정책
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
```

### 2. **NextAuth.js 테이블 RLS 문제**

```sql
-- accounts, sessions 테이블의 RLS 정책
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- 서비스 계정을 위한 정책
CREATE POLICY "Service role can access all" ON accounts
  FOR ALL USING (auth.role() = 'service_role');
```

### 3. **주문 관련 RLS 정책**

```sql
-- orders 테이블
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 4. **결제 정보 보안**

```sql
-- payments 테이블
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 주문 소유자만 결제 정보 조회 가능
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = payments.order_id
      AND orders.user_id = auth.uid()
    )
  );
```

## 🔧 해결 방법

### 1. **RLS 정책 생성 스크립트**

모든 테이블에 대한 적절한 RLS 정책을 생성해야 함

### 2. **서비스 역할 설정**

Prisma 클라이언트가 사용할 서비스 계정의 RLS 우회 권한

### 3. **인증 컨텍스트 설정**

NextAuth.js와 Supabase Auth 연동 시 인증 컨텍스트 설정

## 📋 확인해야 할 사항

1. **데이터베이스 연결 테스트**
2. **각 테이블의 RLS 활성화 상태**
3. **RLS 정책 존재 여부**
4. **서비스 역할 권한**
5. **NextAuth.js 연동 문제**
