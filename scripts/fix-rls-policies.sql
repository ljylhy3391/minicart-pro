-- RLS 정책 수정 및 생성 스크립트
-- 이 스크립트는 Supabase에서 실행해야 합니다.

-- 1. 모든 테이블에 RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

-- 2. 기존 정책 삭제 (있다면)
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Service role access accounts" ON accounts;
DROP POLICY IF EXISTS "Service role access sessions" ON sessions;
DROP POLICY IF EXISTS "Service role access verification_tokens" ON verification_tokens;
DROP POLICY IF EXISTS "Public can view categories" ON categories;
DROP POLICY IF EXISTS "Public can view products" ON products;
DROP POLICY IF EXISTS "Public can view product_images" ON product_images;
DROP POLICY IF EXISTS "Public can view product_variants" ON product_variants;
DROP POLICY IF EXISTS "Public can view inventory" ON inventory;
DROP POLICY IF EXISTS "Users can manage own cart" ON cart;
DROP POLICY IF EXISTS "Users can manage own cart_items" ON cart_items;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;
DROP POLICY IF EXISTS "Users can view own order_items" ON order_items;
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "Service role can manage payments" ON payments;
DROP POLICY IF EXISTS "Public can view coupons" ON coupons;
DROP POLICY IF EXISTS "Users can view own coupon_usage" ON coupon_usage;
DROP POLICY IF EXISTS "Public can view reviews" ON reviews;
DROP POLICY IF EXISTS "Users can manage own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can view own refunds" ON refunds;
DROP POLICY IF EXISTS "Service role can manage refunds" ON refunds;

-- 3. 사용자 테이블 정책
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id::uuid);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id::uuid);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id::uuid);

-- 4. NextAuth.js 테이블 정책 (서비스 역할 허용)
CREATE POLICY "Service role access accounts" ON accounts
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role access sessions" ON sessions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role access verification_tokens" ON verification_tokens
  FOR ALL USING (auth.role() = 'service_role');

-- 5. 공개 상품 관련 테이블 정책
CREATE POLICY "Public can view categories" ON categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view products" ON products
  FOR SELECT USING (status = 'active');

CREATE POLICY "Public can view product_images" ON product_images
  FOR SELECT USING (true);

CREATE POLICY "Public can view product_variants" ON product_variants
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view inventory" ON inventory
  FOR SELECT USING (true);

-- 6. 장바구니 관련 정책
CREATE POLICY "Users can manage own cart" ON cart
  FOR ALL USING (auth.uid() = user_id::uuid);

CREATE POLICY "Users can manage own cart_items" ON cart_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM cart 
      WHERE cart.id = cart_items.cart_id 
      AND cart.user_id::uuid = auth.uid()
    )
  );

-- 7. 주문 관련 정책
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id::uuid);

CREATE POLICY "Users can create own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id::uuid);

CREATE POLICY "Users can update own orders" ON orders
  FOR UPDATE USING (auth.uid() = user_id::uuid);

CREATE POLICY "Users can view own order_items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id::uuid = auth.uid()
    )
  );

-- 8. 결제 관련 정책
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = payments.order_id 
      AND orders.user_id::uuid = auth.uid()
    )
  );

CREATE POLICY "Service role can manage payments" ON payments
  FOR ALL USING (auth.role() = 'service_role');

-- 9. 쿠폰 관련 정책
CREATE POLICY "Public can view coupons" ON coupons
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view own coupon_usage" ON coupon_usage
  FOR SELECT USING (auth.uid() = user_id::uuid);

-- 10. 리뷰 관련 정책
CREATE POLICY "Public can view reviews" ON reviews
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Users can manage own reviews" ON reviews
  FOR ALL USING (auth.uid() = user_id::uuid);

-- 11. 환불 관련 정책
CREATE POLICY "Users can view own refunds" ON refunds
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM payments 
      JOIN orders ON orders.id = payments.order_id
      WHERE payments.id = refunds.payment_id 
      AND orders.user_id::uuid = auth.uid()
    )
  );

CREATE POLICY "Service role can manage refunds" ON refunds
  FOR ALL USING (auth.role() = 'service_role');

-- 12. 서비스 역할을 위한 함수 생성 (필요시)
-- 이 함수는 Prisma 클라이언트가 데이터베이스에 접근할 때 사용됩니다.
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS uuid
LANGUAGE sql STABLE
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claim.sub', true),
    current_setting('request.jwt.claim.user_id', true)
  )::uuid
$$;

-- 13. 서비스 역할 확인 함수
CREATE OR REPLACE FUNCTION auth.role()
RETURNS text
LANGUAGE sql STABLE
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claim.role', true),
    'anon'
  )
$$;
