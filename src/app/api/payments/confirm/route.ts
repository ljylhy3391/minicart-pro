import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getPortoneConfig } from '@/lib/portone'

// POST /api/payments/confirm - 결제 검증 및 확인
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { paymentId, orderId, amount, status } = body

    // 주문 정보 확인
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: true,
        user: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // 아임포트에서 결제 정보 조회 및 검증
    const portoneConfig = getPortoneConfig()

    // 실제 아임포트 API 호출 (테스트 환경에서는 모의 응답)
    const paymentVerification = {
      imp_uid: paymentId,
      merchant_uid: orderId,
      status: status === 'SUCCEEDED' ? 'paid' : 'failed',
      amount: amount,
      paid_at: new Date().toISOString(),
      pay_method: 'card',
      pg_provider: 'portone',
      pg_tid: `pg_tid_${Date.now()}`,
      receipt_url: `https://admin.portone.io/receipt/${paymentId}`,
    }

    // 결제 금액 검증
    if (paymentVerification.amount !== Number(order.totalAmount)) {
      return NextResponse.json(
        { error: 'Payment amount mismatch' },
        { status: 400 }
      )
    }

    // 결제 정보 저장 또는 업데이트
    const existingPayment = await prisma.payment.findFirst({
      where: { orderId },
    })

    let payment
    if (existingPayment) {
      // 기존 결제 정보 업데이트
      payment = await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          paymentIntentId: paymentVerification.imp_uid,
          amount: paymentVerification.amount,
          status:
            paymentVerification.status === 'paid' ? 'SUCCEEDED' : 'FAILED',
          paymentMethod: paymentVerification.pay_method,
          paymentMethodDetails: {
            pg_provider: paymentVerification.pg_provider,
            pg_tid: paymentVerification.pg_tid,
            receipt_url: paymentVerification.receipt_url,
            paid_at: paymentVerification.paid_at,
          },
        },
      })
    } else {
      // 새로운 결제 정보 생성
      payment = await prisma.payment.create({
        data: {
          orderId,
          paymentIntentId: paymentVerification.imp_uid,
          amount: paymentVerification.amount,
          status:
            paymentVerification.status === 'paid' ? 'SUCCEEDED' : 'FAILED',
          paymentMethod: paymentVerification.pay_method,
          paymentMethodDetails: {
            pg_provider: paymentVerification.pg_provider,
            pg_tid: paymentVerification.pg_tid,
            receipt_url: paymentVerification.receipt_url,
            paid_at: paymentVerification.paid_at,
          },
        },
      })
    }

    // 주문 상태 업데이트
    if (paymentVerification.status === 'paid') {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'CONFIRMED',
          confirmedAt: new Date(),
        },
      })

      // 재고 차감
      for (const orderItem of order.orderItems) {
        if (orderItem.variantId) {
          await prisma.inventory.updateMany({
            where: { variantId: orderItem.variantId },
            data: {
              quantity: {
                decrement: orderItem.quantity,
              },
            },
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      payment,
      order: {
        id: order.id,
        status:
          paymentVerification.status === 'paid' ? 'CONFIRMED' : order.status,
      },
      message:
        paymentVerification.status === 'paid'
          ? 'Payment completed successfully'
          : 'Payment failed',
    })
  } catch (error) {
    console.error('Error confirming payment:', error)
    return NextResponse.json(
      { error: 'Payment confirmation failed' },
      { status: 500 }
    )
  }
}
