-- 간단한 RLS 정책 설정
-- 이 스크립트는 Supabase 대시보드에서 실행해야 합니다.

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

-- 2. 기본 공개 정책 (모든 사용자가 읽기 가능)
CREATE POLICY "Public can view categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Public can view products" ON products
  FOR SELECT USING (true);

CREATE POLICY "Public can view product_images" ON product_images
  FOR SELECT USING (true);

CREATE POLICY "Public can view product_variants" ON product_variants
  FOR SELECT USING (true);

CREATE POLICY "Public can view inventory" ON inventory
  FOR SELECT USING (true);

CREATE POLICY "Public can view coupons" ON coupons
  FOR SELECT USING (true);

CREATE POLICY "Public can view reviews" ON reviews
  FOR SELECT USING (true);

-- 3. 서비스 역할 정책 (Prisma 클라이언트 접근용)
CREATE POLICY "Service role access accounts" ON accounts
  FOR ALL USING (true);

CREATE POLICY "Service role access sessions" ON sessions
  FOR ALL USING (true);

CREATE POLICY "Service role access verification_tokens" ON verification_tokens
  FOR ALL USING (true);

CREATE POLICY "Service role access users" ON users
  FOR ALL USING (true);

CREATE POLICY "Service role access cart" ON cart
  FOR ALL USING (true);

CREATE POLICY "Service role access cart_items" ON cart_items
  FOR ALL USING (true);

CREATE POLICY "Service role access orders" ON orders
  FOR ALL USING (true);

CREATE POLICY "Service role access order_items" ON order_items
  FOR ALL USING (true);

CREATE POLICY "Service role access payments" ON payments
  FOR ALL USING (true);

CREATE POLICY "Service role access coupon_usage" ON coupon_usage
  FOR ALL USING (true);

CREATE POLICY "Service role access refunds" ON refunds
  FOR ALL USING (true);
