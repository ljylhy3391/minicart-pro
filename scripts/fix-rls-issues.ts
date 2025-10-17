import { PrismaClient } from '@prisma/client'

// RLS 문제를 해결하기 위한 스크립트
const prisma = new PrismaClient()

async function checkRLSIssues() {
  console.log('🔍 RLS 문제 확인 중...')

  try {
    // 1. 데이터베이스 연결 테스트
    console.log('1. 데이터베이스 연결 테스트...')
    await prisma.$connect()
    console.log('✅ 데이터베이스 연결 성공')

    // 2. 기본 테이블 존재 확인
    console.log('2. 기본 테이블 존재 확인...')

    const tables = [
      'users',
      'accounts',
      'sessions',
      'verification_tokens',
      'categories',
      'products',
      'product_images',
      'product_variants',
      'inventory',
      'cart',
      'cart_items',
      'orders',
      'order_items',
      'payments',
      'coupons',
      'coupon_usage',
      'reviews',
      'refunds',
    ]

    for (const table of tables) {
      try {
        // 테이블 존재 확인을 위한 간단한 쿼리
        const result = await prisma.$queryRaw`SELECT 1 FROM ${table} LIMIT 1`
        console.log(`✅ ${table} 테이블 접근 가능`)
      } catch (error) {
        console.log(`❌ ${table} 테이블 접근 실패:`, error)
      }
    }

    // 3. 사용자 데이터 확인
    console.log('3. 사용자 데이터 확인...')
    try {
      const userCount = await prisma.user.count()
      console.log(`✅ 사용자 수: ${userCount}`)
    } catch (error) {
      console.log('❌ 사용자 데이터 접근 실패:', error)
    }

    // 4. 상품 데이터 확인
    console.log('4. 상품 데이터 확인...')
    try {
      const productCount = await prisma.product.count()
      console.log(`✅ 상품 수: ${productCount}`)
    } catch (error) {
      console.log('❌ 상품 데이터 접근 실패:', error)
    }

    // 5. 주문 데이터 확인
    console.log('5. 주문 데이터 확인...')
    try {
      const orderCount = await prisma.order.count()
      console.log(`✅ 주문 수: ${orderCount}`)
    } catch (error) {
      console.log('❌ 주문 데이터 접근 실패:', error)
    }

    // 6. 결제 데이터 확인
    console.log('6. 결제 데이터 확인...')
    try {
      const paymentCount = await prisma.payment.count()
      console.log(`✅ 결제 수: ${paymentCount}`)
    } catch (error) {
      console.log('❌ 결제 데이터 접근 실패:', error)
    }
  } catch (error) {
    console.error('❌ RLS 문제 확인 중 오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

async function testSpecificRLSIssues() {
  console.log('\n🔧 특정 RLS 문제 테스트...')

  try {
    await prisma.$connect()

    // 1. 익명 사용자로 공개 데이터 접근 테스트
    console.log('1. 공개 상품 데이터 접근 테스트...')
    try {
      const products = await prisma.product.findMany({
        where: { isActive: true },
        take: 5,
      })
      console.log(`✅ 공개 상품 ${products.length}개 조회 성공`)
    } catch (error) {
      console.log('❌ 공개 상품 조회 실패:', error)
    }

    // 2. 카테고리 접근 테스트
    console.log('2. 카테고리 데이터 접근 테스트...')
    try {
      const categories = await prisma.category.findMany({
        where: { isActive: true },
      })
      console.log(`✅ 활성 카테고리 ${categories.length}개 조회 성공`)
    } catch (error) {
      console.log('❌ 카테고리 조회 실패:', error)
    }

    // 3. 리뷰 접근 테스트
    console.log('3. 공개 리뷰 접근 테스트...')
    try {
      const reviews = await prisma.review.findMany({
        where: { isApproved: true },
        take: 5,
      })
      console.log(`✅ 승인된 리뷰 ${reviews.length}개 조회 성공`)
    } catch (error) {
      console.log('❌ 리뷰 조회 실패:', error)
    }
  } catch (error) {
    console.error('❌ 특정 RLS 테스트 중 오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

async function main() {
  console.log('🚀 RLS 문제 진단 시작\n')

  await checkRLSIssues()
  await testSpecificRLSIssues()

  console.log('\n📋 RLS 문제 해결 방법:')
  console.log('1. Supabase 대시보드에서 SQL 에디터 열기')
  console.log('2. scripts/fix-rls-policies.sql 파일 내용 실행')
  console.log('3. 서비스 역할 키 설정 확인')
  console.log('4. 환경 변수 DATABASE_URL에 서비스 역할 키 포함 확인')

  console.log('\n✨ RLS 문제 진단 완료')
}

if (require.main === module) {
  main().catch(console.error)
}

export { checkRLSIssues, testSpecificRLSIssues }
