# RLS (Row Level Security) 문제 해결 가이드

## ✅ 해결 완료 (2025년 10월 15일)

- ✅ 데이터베이스 연결 문제 해결: Supabase 프로젝트 연결 성공
- ✅ RLS 정책 설정 완료: 모든 테이블에 보안 정책 적용
- ✅ 서비스 역할 권한 설정 완료
- ✅ 시드 데이터 생성 완료: 테스트용 데이터 4개 상품, 3개 카테고리, 2개 쿠폰

## 🚨 이전 상황 (해결됨)

- 데이터베이스 연결 문제: `Can't reach database server`
- RLS 정책 설정 필요
- 서비스 역할 권한 문제 가능성

## 🔧 해결 방법

### 1. **즉시 해결 방법**

#### A. Supabase 대시보드에서 RLS 정책 설정

1. [Supabase 대시보드](https://supabase.com/dashboard/project/ihqrscprivsmufjplcha) 접속
2. **SQL Editor** 열기
3. `scripts/fix-rls-policies.sql` 파일 내용 복사하여 실행

#### B. 서비스 역할 키 확인

```bash
# 환경 변수에 서비스 역할 키가 포함되어 있는지 확인
# 일반적인 DATABASE_URL 형태:
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.ihqrscprivsmufjplcha.supabase.co:5432/postgres?sslmode=require

# 서비스 역할 키가 포함된 형태:
DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[SERVICE_ROLE_KEY]@db.ihqrscprivsmufjplcha.supabase.co:5432/postgres?sslmode=require
```

### 2. **단계별 해결 과정**

#### Step 1: 데이터베이스 연결 테스트

```bash
# 1. 네트워크 연결 확인
ping db.ihqrscprivsmufjplcha.supabase.co

# 2. 포트 연결 확인
telnet db.ihqrscprivsmufjplcha.supabase.co 5432

# 3. SSL 연결 테스트
openssl s_client -connect db.ihqrscprivsmufjplcha.supabase.co:5432 -starttls postgres
```

#### Step 2: Supabase 프로젝트 상태 확인

1. Supabase 대시보드에서 프로젝트 상태 확인
2. 프로젝트가 일시정지되었는지 확인
3. 필요시 프로젝트 재시작

#### Step 3: RLS 정책 적용

Supabase SQL Editor에서 다음 스크립트 실행:

```sql
-- 1. 모든 테이블에 RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
-- ... (나머지 테이블들)

-- 2. 기본 정책 생성
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Service role access" ON accounts
  FOR ALL USING (auth.role() = 'service_role');

-- 3. 공개 데이터 정책
CREATE POLICY "Public can view products" ON products
  FOR SELECT USING (is_active = true);
```

### 3. **환경 변수 설정**

#### A. 개발 환경용 DATABASE_URL

```bash
# .env.local 파일에 추가
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.ihqrscprivsmufjplcha.supabase.co:5432/postgres?sslmode=require"

# 서비스 역할 키가 필요한 경우
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[SERVICE_ROLE_KEY]@db.ihqrscprivsmufjplcha.supabase.co:5432/postgres?sslmode=require"
```

#### B. 서비스 역할 키 확인

1. Supabase 대시보드 → Settings → API
2. `service_role` 키 복사
3. 환경 변수에 포함

### 4. **일반적인 RLS 문제들**

#### A. 서비스 역할 권한 문제

```sql
-- 서비스 역할이 모든 테이블에 접근할 수 있도록 설정
CREATE POLICY "Service role full access" ON [table_name]
  FOR ALL USING (auth.role() = 'service_role');
```

#### B. 사용자 인증 문제

```sql
-- auth.uid() 함수가 제대로 작동하는지 확인
SELECT auth.uid(), auth.role();
```

#### C. 정책 충돌 문제

```sql
-- 기존 정책 삭제 후 재생성
DROP POLICY IF EXISTS "[policy_name]" ON [table_name];
CREATE POLICY "[policy_name]" ON [table_name] ...;
```

### 5. **테스트 방법**

#### A. Prisma 연결 테스트

```bash
npx prisma db push
npx prisma generate
```

#### B. RLS 정책 테스트

```sql
-- 사용자로 로그인한 상태에서 테스트
SELECT * FROM users; -- 자신의 데이터만 보여야 함
SELECT * FROM orders; -- 자신의 주문만 보여야 함
SELECT * FROM products; -- 모든 상품이 보여야 함
```

### 6. **응급 해결 방법**

#### A. RLS 일시 비활성화 (개발용)

```sql
-- 모든 테이블의 RLS 일시 비활성화
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
-- ... (필요한 테이블들)
```

#### B. 서비스 역할 우회

```sql
-- 서비스 역할로 모든 정책 우회
SET LOCAL role = 'service_role';
```

### 7. **모니터링 및 로그**

#### A. Supabase 로그 확인

1. 대시보드 → Logs → Postgres Logs
2. RLS 관련 오류 메시지 확인
3. 연결 문제 로그 확인

#### B. 애플리케이션 로그

```javascript
// Prisma 클라이언트에 로깅 추가
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})
```

## 📞 추가 지원

1. **Supabase 공식 문서**: https://supabase.com/docs/guides/auth/row-level-security
2. **Prisma RLS 가이드**: https://www.prisma.io/docs/concepts/components/prisma-client/relation-queries
3. **커뮤니티 지원**: Supabase Discord 또는 GitHub Issues

## ⚠️ 주의사항

- 프로덕션 환경에서는 RLS를 절대 비활성화하지 마세요
- 서비스 역할 키는 환경 변수로만 관리하고 코드에 하드코딩하지 마세요
- RLS 정책 변경 후에는 반드시 테스트를 수행하세요
