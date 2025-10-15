import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/payments - 결제 요청 생성
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, paymentMethod = 'card' } = body

    // 주문 정보 확인
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
        user: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (order.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Order is not in pending status' },
        { status: 400 }
      )
    }

    // 결제 요청 정보 생성
    const paymentRequest = {
      orderId,
      amount: Number(order.totalAmount),
      productName:
        order.orderItems.length === 1
          ? order.orderItems[0].productName
          : `${order.orderItems[0].productName} 외 ${order.orderItems.length - 1}개`,
      buyerInfo: {
        name: order.user.name,
        email: order.user.email,
        phone: order.user.phone || undefined,
      },
      paymentMethod,
    }

    return NextResponse.json({
      success: true,
      paymentRequest,
      message: 'Payment request created successfully',
    })
  } catch (error) {
    console.error('Error creating payment request:', error)
    return NextResponse.json(
      { error: 'Payment request failed' },
      { status: 500 }
    )
  }
}

// GET /api/payments/[orderId] - 결제 정보 조회
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    const payment = await prisma.payment.findFirst({
      where: { orderId },
      include: {
        order: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // 주문 소유자 확인
    if (payment.order.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json(payment)
  } catch (error) {
    console.error('Error fetching payment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment' },
      { status: 500 }
    )
  }
}
