import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 테스트 데이터 생성 시작...')

  // 1. 카테고리 생성
  console.log('📂 카테고리 생성 중...')
  const electronics = await prisma.category.create({
    data: {
      name: '전자제품',
      slug: 'electronics',
      description: '다양한 전자제품을 만나보세요',
      sortOrder: 1,
    },
  })

  const fashion = await prisma.category.create({
    data: {
      name: '패션',
      slug: 'fashion',
      description: '트렌디한 패션 아이템',
      sortOrder: 2,
    },
  })

  const home = await prisma.category.create({
    data: {
      name: '홈&리빙',
      slug: 'home-living',
      description: '편리한 홈리빙 제품',
      sortOrder: 3,
    },
  })

  console.log('✅ 카테고리 생성 완료')

  // 2. 상품 생성
  console.log('📦 상품 생성 중...')

  // 스마트폰
  const smartphone = await prisma.product.create({
    data: {
      name: '갤럭시 S24',
      slug: 'galaxy-s24',
      description:
        '최신 기술이 집약된 스마트폰입니다. 고해상도 카메라와 빠른 처리속도를 자랑합니다.',
      shortDescription: '최신 갤럭시 스마트폰',
      price: 1200000,
      comparePrice: 1400000,
      sku: 'GAL-S24-001',
      brand: 'Samsung',
      status: 'ACTIVE',
      featured: true,
      tags: ['스마트폰', '갤럭시', '최신'],
      categoryId: electronics.id,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500',
            altText: '갤럭시 S24 메인 이미지',
            sortOrder: 1,
            isPrimary: true,
          },
        ],
      },
      variants: {
        create: [
          {
            name: '256GB 블랙',
            sku: 'GAL-S24-256-BLK',
            price: 1200000,
            attributes: { storage: '256GB', color: '블랙' },
            sortOrder: 1,
          },
          {
            name: '512GB 화이트',
            sku: 'GAL-S24-512-WHT',
            price: 1400000,
            attributes: { storage: '512GB', color: '화이트' },
            sortOrder: 2,
          },
        ],
      },
    },
  })

  // 무선 이어폰
  const earbuds = await prisma.product.create({
    data: {
      name: '에어팟 프로 3세대',
      slug: 'airpods-pro-3rd',
      description: '노이즈 캔슬링 기능이 탑재된 프리미엄 무선 이어폰입니다.',
      shortDescription: '프리미엄 무선 이어폰',
      price: 350000,
      comparePrice: 400000,
      sku: 'AP-PRO-3-001',
      brand: 'Apple',
      status: 'ACTIVE',
      featured: true,
      tags: ['이어폰', '무선', '노이즈캔슬링'],
      categoryId: electronics.id,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500',
            altText: '에어팟 프로 3세대',
            sortOrder: 1,
            isPrimary: true,
          },
        ],
      },
      variants: {
        create: [
          {
            name: '화이트',
            sku: 'AP-PRO-3-WHT',
            price: 350000,
            attributes: { color: '화이트' },
            sortOrder: 1,
          },
        ],
      },
    },
  })

  // 티셔츠
  const tshirt = await prisma.product.create({
    data: {
      name: '기본 면 티셔츠',
      slug: 'basic-cotton-tshirt',
      description:
        '부드러운 면 소재의 기본 티셔츠입니다. 다양한 컬러로 제공됩니다.',
      shortDescription: '컴포트한 기본 티셔츠',
      price: 29000,
      comparePrice: 35000,
      sku: 'TS-COT-001',
      brand: 'Basic Brand',
      status: 'ACTIVE',
      featured: false,
      tags: ['티셔츠', '면', '기본'],
      categoryId: fashion.id,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
            altText: '기본 면 티셔츠',
            sortOrder: 1,
            isPrimary: true,
          },
        ],
      },
      variants: {
        create: [
          {
            name: 'S 화이트',
            sku: 'TS-COT-S-WHT',
            price: 29000,
            attributes: { size: 'S', color: '화이트' },
            sortOrder: 1,
          },
          {
            name: 'M 블랙',
            sku: 'TS-COT-M-BLK',
            price: 29000,
            attributes: { size: 'M', color: '블랙' },
            sortOrder: 2,
          },
          {
            name: 'L 네이비',
            sku: 'TS-COT-L-NAV',
            price: 29000,
            attributes: { size: 'L', color: '네이비' },
            sortOrder: 3,
          },
        ],
      },
    },
  })

  // 커피 머신
  const coffeeMachine = await prisma.product.create({
    data: {
      name: '네스프레소 에센자 미니',
      slug: 'nespresso-essenza-mini',
      description:
        '컴팩트한 디자인의 네스프레소 커피 머신입니다. 원터치로 완벽한 에스프레소를 만드세요.',
      shortDescription: '컴팩트 커피 머신',
      price: 180000,
      comparePrice: 220000,
      sku: 'NS-ESS-MINI-001',
      brand: 'Nespresso',
      status: 'ACTIVE',
      featured: true,
      tags: ['커피머신', '네스프레소', '홈카페'],
      categoryId: home.id,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500',
            altText: '네스프레소 커피 머신',
            sortOrder: 1,
            isPrimary: true,
          },
        ],
      },
      variants: {
        create: [
          {
            name: '화이트',
            sku: 'NS-ESS-MINI-WHT',
            price: 180000,
            attributes: { color: '화이트' },
            sortOrder: 1,
          },
          {
            name: '블랙',
            sku: 'NS-ESS-MINI-BLK',
            price: 180000,
            attributes: { color: '블랙' },
            sortOrder: 2,
          },
        ],
      },
    },
  })

  console.log('✅ 상품 생성 완료')

  // 3. 재고 데이터 생성
  console.log('📊 재고 데이터 생성 중...')

  // 모든 상품 변형에 대해 재고 생성
  const allVariants = await prisma.productVariant.findMany({
    include: { product: true },
  })

  for (const variant of allVariants) {
    await prisma.inventory.create({
      data: {
        variantId: variant.id,
        quantity: Math.floor(Math.random() * 50) + 10, // 10-59개 랜덤 재고
        reservedQuantity: 0,
        lowStockThreshold: 10,
        location: '메인 창고',
      },
    })
  }

  console.log('✅ 재고 데이터 생성 완료')

  // 4. 쿠폰 생성
  console.log('🎫 쿠폰 생성 중...')

  await prisma.coupon.create({
    data: {
      code: 'WELCOME10',
      name: '신규 가입 10% 할인',
      description: '첫 구매 시 10% 할인',
      type: 'PERCENTAGE',
      value: 10,
      minimumAmount: 50000,
      maximumDiscount: 50000,
      usageLimit: 1000,
      isActive: true,
    },
  })

  await prisma.coupon.create({
    data: {
      code: 'SAVE5000',
      name: '5,000원 할인',
      description: '30,000원 이상 구매 시 5,000원 할인',
      type: 'FIXED_AMOUNT',
      value: 5000,
      minimumAmount: 30000,
      isActive: true,
    },
  })

  console.log('✅ 쿠폰 생성 완료')

  console.log('🎉 모든 테스트 데이터 생성 완료!')
  console.log(`📦 생성된 상품 수: 4개`)
  console.log(`📂 생성된 카테고리 수: 3개`)
  console.log(`🎫 생성된 쿠폰 수: 2개`)
  console.log(`📊 생성된 재고 수: ${allVariants.length}개`)
}

main()
  .catch((e) => {
    console.error('❌ 데이터 생성 중 오류 발생:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
