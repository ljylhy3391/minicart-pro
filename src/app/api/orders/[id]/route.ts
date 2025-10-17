import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/orders/[id] - 주문 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orderId = params.id

    // 주문 정보 조회 (결제 정보 포함)
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        orderItems: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: true,
                  },
                },
              },
            },
          },
        },
        payment: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // 주문 소유자 확인
    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // 응답 데이터 변환
    const orderData = {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: Number(order.totalAmount),
      items: order.orderItems.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        price: Number(item.price),
        selectedVariants: item.selectedVariants,
        product: {
          id: item.variant.product.id,
          name: item.productName,
          description: item.variant.product.description,
          images: item.variant.product.images.map((img) => ({
            id: img.id,
            url: img.url,
            alt: img.alt,
          })),
        },
      })),
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.payment?.status || null,
      payment: order.payment
        ? {
            id: order.payment.id,
            amount: Number(order.payment.amount),
            status: order.payment.status,
            paymentMethod: order.payment.paymentMethod,
            refundAmount: order.payment.refundAmount
              ? Number(order.payment.refundAmount)
              : undefined,
            refundedAt: order.payment.refundedAt?.toISOString(),
          }
        : undefined,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    }

    return NextResponse.json(orderData)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

// PATCH /api/orders/[id] - 주문 상태 업데이트 (취소 등)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orderId = params.id
    const body = await request.json()
    const { status } = body

    // 주문 정보 조회
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // 주문 소유자 확인
    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // 주문 상태 업데이트
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        ...(status === 'CANCELLED' && { cancelledAt: new Date() }),
      },
    })

    // 결제가 있다면 결제 상태도 업데이트
    if (order.paymentId) {
      await prisma.payment.update({
        where: { orderId },
        data: {
          status: status === 'CANCELLED' ? 'CANCELLED' : order.status,
        },
      })
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: 'Order status updated successfully',
    })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}
