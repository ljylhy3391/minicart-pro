import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/cart - 장바구니 조회
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cart = await prisma.cart.findFirst({
      where: {
        userId: session.user.id,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
                variants: true,
                category: true,
              },
            },
            variant: {
              include: {
                product: {
                  include: {
                    images: true,
                    category: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    // 카트가 없을 때 빈 카트 객체 반환
    if (!cart) {
      return NextResponse.json({
        id: null,
        items: [],
      })
    }

    return NextResponse.json(cart)
  } catch (error) {
    console.error('Error fetching cart:', error)

    // 데이터베이스 연결 에러 등 예외 상황 처리
    if (error instanceof Error) {
      // 데이터베이스 연결 문제인 경우 빈 카트 반환
      if (
        error.message.includes('Tenant') ||
        error.message.includes('not found')
      ) {
        console.warn('Database connection issue, returning empty cart')
        return NextResponse.json({
          id: null,
          items: [],
        })
      }
    }

    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 })
  }
}

// POST /api/cart - 장바구니에 상품 추가
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { productId, quantity, selectedVariants } = body

    // 장바구니 찾기 또는 생성
    let cart = await prisma.cart.findFirst({
      where: {
        userId: session.user.id,
      },
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: session.user.id,
        },
      })
    }

    // 기존 아이템 확인
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        selectedVariants: selectedVariants || null,
      },
    })

    if (existingItem) {
      // 수량 업데이트
      await prisma.cartItem.update({
        where: {
          id: existingItem.id,
        },
        data: {
          quantity: existingItem.quantity + quantity,
        },
      })
    } else {
      // 새 아이템 추가
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          selectedVariants: selectedVariants || null,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json(
      { error: 'Failed to add to cart' },
      { status: 500 }
    )
  }
}

// PUT /api/cart - 장바구니 아이템 수량 수정
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { itemId, quantity } = body

    if (quantity <= 0) {
      // 수량이 0 이하면 아이템 삭제
      await prisma.cartItem.delete({
        where: {
          id: itemId,
        },
      })
    } else {
      // 수량 업데이트
      await prisma.cartItem.update({
        where: {
          id: itemId,
        },
        data: {
          quantity,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating cart:', error)
    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 500 }
    )
  }
}

// DELETE /api/cart - 장바구니 아이템 삭제
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('itemId')

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      )
    }

    await prisma.cartItem.delete({
      where: {
        id: itemId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting cart item:', error)
    return NextResponse.json(
      { error: 'Failed to delete cart item' },
      { status: 500 }
    )
  }
}
