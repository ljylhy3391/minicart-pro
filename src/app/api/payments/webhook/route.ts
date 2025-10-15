import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPortoneConfig } from '@/lib/portone'

// POST /api/payments/webhook - 아임포트 웹훅 처리
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 웹훅 시그니처 검증 (실제 구현 시 필요)
    const signature = request.headers.get('x-portone-signature')
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    // 웹훅 데이터 파싱
    const {
      imp_uid,
      merchant_uid,
      status,
      amount,
      pay_method,
      pg_provider,
      pg_tid,
      paid_at,
      failed_reason,
      receipt_url,
    } = body

    console.log('PortOne webhook received:', {
      imp_uid,
      merchant_uid,
      status,
      amount,
    })

    // 주문 정보 조회
    const order = await prisma.order.findUnique({
      where: { id: merchant_uid },
      include: {
        orderItems: true,
      },
    })

    if (!order) {
      console.error('Order not found:', merchant_uid)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // 결제 금액 검증
    if (amount !== Number(order.totalAmount)) {
      console.error('Amount mismatch:', {
        webhook: amount,
        order: order.totalAmount,
      })
      return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 })
    }

    // 결제 상태에 따른 처리
    if (status === 'paid') {
      // 결제 성공
      const payment = await prisma.payment.upsert({
        where: { paymentIntentId: imp_uid },
        update: {
          status: 'SUCCEEDED',
          paymentMethod: pay_method,
          paymentMethodDetails: {
            pg_provider,
            pg_tid,
            receipt_url,
            paid_at,
          },
        },
        create: {
          orderId: order.id,
          paymentIntentId: imp_uid,
          amount: amount,
          status: 'SUCCEEDED',
          paymentMethod: pay_method,
          paymentMethodDetails: {
            pg_provider,
            pg_tid,
            receipt_url,
            paid_at,
          },
        },
      })

      // 주문 상태 업데이트
      await prisma.order.update({
        where: { id: order.id },
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

      console.log('Payment succeeded:', {
        orderId: order.id,
        paymentId: payment.id,
      })
    } else if (status === 'failed') {
      // 결제 실패
      await prisma.payment.upsert({
        where: { paymentIntentId: imp_uid },
        update: {
          status: 'FAILED',
          failureReason: failed_reason,
        },
        create: {
          orderId: order.id,
          paymentIntentId: imp_uid,
          amount: amount,
          status: 'FAILED',
          failureReason: failed_reason,
        },
      })

      // 주문 상태를 취소로 변경
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
        },
      })

      console.log('Payment failed:', {
        orderId: order.id,
        reason: failed_reason,
      })
    } else if (status === 'cancelled') {
      // 결제 취소
      await prisma.payment.upsert({
        where: { paymentIntentId: imp_uid },
        update: {
          status: 'CANCELLED',
        },
        create: {
          orderId: order.id,
          paymentIntentId: imp_uid,
          amount: amount,
          status: 'CANCELLED',
        },
      })

      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
        },
      })

      console.log('Payment cancelled:', { orderId: order.id })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
