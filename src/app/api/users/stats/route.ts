import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/users/stats - 사용자 통계 조회
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 총 주문 수
    const totalOrders = await prisma.order.count({
      where: {
        userId: session.user.id,
      },
    })

    // 총 구매 금액
    const totalSpentResult = await prisma.order.aggregate({
      where: {
        userId: session.user.id,
        status: {
          not: 'CANCELLED',
        },
      },
      _sum: {
        totalAmount: true,
      },
    })

    const totalSpent = totalSpentResult._sum.totalAmount || 0

    // 최근 주문 5개
    const recentOrders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    })

    return NextResponse.json({
      totalOrders,
      totalSpent,
      recentOrders,
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    )
  }
}
