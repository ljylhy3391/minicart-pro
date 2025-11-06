import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

// GET /api/categories - 카테고리 목록 조회
export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// POST /api/categories - 카테고리 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, slug } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      )
    }

    // slug 자동 생성 (제공되지 않은 경우)
    const categorySlug = slug || slugify(name)

    // 중복 slug 확인 및 처리
    let finalSlug = categorySlug
    let counter = 1
    while (true) {
      const existingCategory = await prisma.category.findUnique({
        where: { slug: finalSlug },
      })
      if (!existingCategory) break
      finalSlug = `${categorySlug}-${counter}`
      counter++
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug: finalSlug,
        description,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}
