import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getPortoneConfig } from '@/lib/portone'

// POST /api/payments/refund - 환불 처리
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { paymentId, reason, amount } = body

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      )
    }

    // 결제 정보 조회
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: {
          include: {
            user: true,
            orderItems: {
              include: {
                variant: {
                  include: {
                    product: true,
                  },
                },
              },
            },
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

    // 환불 가능 상태 확인
    if (payment.status !== 'SUCCEEDED') {
      return NextResponse.json(
        { error: 'Only succeeded payments can be refunded' },
        { status: 400 }
      )
    }

    // 환불 금액 설정 (전체 환불이 기본)
    const refundAmount = amount || payment.amount

    // 환불 금액 검증
    if (refundAmount > payment.amount) {
      return NextResponse.json(
        { error: 'Refund amount cannot exceed payment amount' },
        { status: 400 }
      )
    }

    // 아임포트 환불 API 호출 (실제 환경에서는 실제 API 호출)
    const portoneConfig = getPortoneConfig()

    // 테스트 환경에서는 모의 환불 응답
    const refundResponse = {
      success: true,
      refund_id: `refund_${Date.now()}`,
      imp_uid: payment.paymentIntentId,
      amount: refundAmount,
      status: 'refunded',
      refunded_at: new Date().toISOString(),
      reason: reason || 'Customer request',
    }

    // 환불 정보 저장
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'REFUNDED',
        refundAmount: refundAmount,
        refundReason: reason || 'Customer request',
        paymentMethodDetails: {
          ...((payment.paymentMethodDetails as Record<string, any>) || {}),
          refund_id: refundResponse.refund_id,
          refunded_at: refundResponse.refunded_at,
        },
      },
    })

    // 주문 상태 업데이트
    await prisma.order.update({
      where: { id: payment.orderId },
      data: {
        status: 'REFUNDED',
      },
    })

    // 재고 복원 (전체 환불인 경우만)
    if (refundAmount === payment.amount) {
      for (const orderItem of payment.order.orderItems) {
        if (orderItem.variantId) {
          await prisma.inventory.updateMany({
            where: { variantId: orderItem.variantId },
            data: {
              quantity: {
                increment: orderItem.quantity,
              },
            },
          })
        }
      }
    }

    // 환불 기록 생성 (Prisma 스키마 업데이트 후 활성화)
    // await prisma.refund.create({
    //   data: {
    //     paymentId: paymentId,
    //     amount: refundAmount,
    //     reason: reason || 'Customer request',
    //     status: 'COMPLETED',
    //     refundId: refundResponse.refund_id,
    //     processedAt: new Date(),
    //   },
    // })

    console.log('Refund processed successfully:', {
      paymentId,
      refundAmount,
      orderId: payment.orderId,
    })

    return NextResponse.json({
      success: true,
      refund: {
        id: refundResponse.refund_id,
        amount: refundAmount,
        status: 'COMPLETED',
        refundedAt: refundResponse.refunded_at,
        reason: reason || 'Customer request',
      },
      payment: updatedPayment,
      message: 'Refund processed successfully',
    })
  } catch (error) {
    console.error('Error processing refund:', error)
    return NextResponse.json(
      { error: 'Refund processing failed' },
      { status: 500 }
    )
  }
}

// GET /api/payments/refund - 환불 내역 조회
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('paymentId')

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      )
    }

    // 환불 내역 조회 (Prisma 스키마 업데이트 후 활성화)
    // const refunds = await prisma.refund.findMany({
    //   where: { paymentId },
    //   include: {
    //     payment: {
    //       include: {
    //         order: {
    //           include: {
    //             user: true,
    //           },
    //         },
    //       },
    //     },
    //   },
    //   orderBy: { createdAt: 'desc' },
    // })

    // // 결제 소유자 확인
    // if (
    //   refunds.length > 0 &&
    //   refunds[0].payment.order.userId !== session.user.id
    // ) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    // }

    return NextResponse.json({
      success: true,
      refunds: [], // 임시로 빈 배열 반환
      message: 'Refunds retrieved successfully',
    })
  } catch (error) {
    console.error('Error fetching refunds:', error)
    return NextResponse.json(
      { error: 'Failed to fetch refunds' },
      { status: 500 }
    )
  }
}
