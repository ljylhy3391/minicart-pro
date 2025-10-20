import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

// GET /api/products - 상품 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    const where: any = {}

    if (category) {
      where.categoryId = category
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        images: true,
        variants: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    })

    const total = await prisma.product.count({ where })

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// POST /api/products - 상품 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, price, categoryId, images, variants } = body

    // slug 자동 생성
    const slug = slugify(name)

    // 중복 slug 확인 및 처리
    let finalSlug = slug
    let counter = 1
    while (true) {
      const existingProduct = await prisma.product.findUnique({
        where: { slug: finalSlug },
      })
      if (!existingProduct) break
      finalSlug = `${slug}-${counter}`
      counter++
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug: finalSlug,
        description,
        price,
        categoryId,
        images: {
          create: images?.map((image: any) => ({
            url: image.url,
            altText: image.alt || name,
            sortOrder: 1,
            isPrimary: true,
          })),
        },
        variants: {
          create: variants?.map((variant: any) => ({
            name: variant.name,
            attributes: variant.attributes || {},
            sortOrder: 1,
          })),
        },
      },
      include: {
        category: true,
        images: true,
        variants: true,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
