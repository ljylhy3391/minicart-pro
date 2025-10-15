'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserMenu } from '@/components/auth/user-menu'
import Link from 'next/link'
import Image from 'next/image'

interface UserStats {
  totalOrders: number
  totalSpent: number
  recentOrders: {
    id: string
    orderNumber: string
    totalAmount: number
    status: string
    createdAt: string
  }[]
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUserStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/users/stats')

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/signin')
          return
        }
        throw new Error('사용자 정보를 불러오는데 실패했습니다.')
      }

      const data = await response.json()
      setUserStats(data)
      setError(null)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUserStats()
    } else if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(price)
  }

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      PENDING: '주문 대기',
      CONFIRMED: '주문 확인',
      PROCESSING: '처리 중',
      SHIPPED: '배송 중',
      DELIVERED: '배송 완료',
      CANCELLED: '주문 취소',
      REFUNDED: '환불 완료',
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PROCESSING: 'bg-purple-100 text-purple-800',
      SHIPPED: 'bg-indigo-100 text-indigo-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-gray-100 text-gray-800',
    }
    return colorMap[status] || 'bg-gray-100 text-gray-800'
  }

  const handleSignOut = async () => {
    if (confirm('정말로 로그아웃하시겠습니까?')) {
      await signOut({ callbackUrl: '/' })
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="border-b bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <Link
                href="/products"
                className="text-xl font-bold text-gray-900"
              >
                Minicart Pro
              </Link>
              <UserMenu />
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center py-12">
          <div className="text-lg text-gray-600">프로필을 불러오는 중...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="border-b bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <Link
                href="/products"
                className="text-xl font-bold text-gray-900"
              >
                Minicart Pro
              </Link>
              <UserMenu />
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-md border border-red-200 bg-red-50 p-4">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-xl font-bold text-gray-900">
                Minicart Pro
              </Link>
              <nav className="hidden space-x-6 md:flex">
                <Link
                  href="/products"
                  className="text-gray-600 hover:text-gray-900"
                >
                  상품
                </Link>
                <Link
                  href="/cart"
                  className="text-gray-600 hover:text-gray-900"
                >
                  장바구니
                </Link>
                <Link
                  href="/orders"
                  className="text-gray-600 hover:text-gray-900"
                >
                  주문내역
                </Link>
              </nav>
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">프로필</h1>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* 사용자 정보 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>사용자 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="relative h-16 w-16">
                    {session?.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt="프로필 이미지"
                        fill
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-200">
                        <span className="text-lg text-gray-500">
                          {session?.user?.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {session?.user?.name || '사용자'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {session?.user?.email}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <Button
                    variant="outline"
                    onClick={handleSignOut}
                    className="w-full"
                  >
                    로그아웃
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 사용자 통계 */}
          <div className="space-y-6 lg:col-span-2">
            {userStats && (
              <>
                {/* 통계 카드 */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="rounded-lg bg-blue-100 p-2">
                          <svg
                            className="h-6 w-6 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                            />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">
                            총 주문 수
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {userStats.totalOrders}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="rounded-lg bg-green-100 p-2">
                          <svg
                            className="h-6 w-6 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                            />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">
                            총 구매 금액
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {formatPrice(userStats.totalSpent)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 최근 주문 */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>최근 주문</CardTitle>
                      <Link href="/orders">
                        <Button variant="outline" size="sm">
                          전체 보기
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {userStats.recentOrders.length === 0 ? (
                      <div className="py-8 text-center">
                        <p className="text-gray-600">주문 내역이 없습니다.</p>
                        <Link href="/products" className="mt-4 inline-block">
                          <Button>쇼핑 시작하기</Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {userStats.recentOrders.map((order) => (
                          <div
                            key={order.id}
                            className="flex items-center justify-between border-b border-gray-100 py-3 last:border-b-0"
                          >
                            <div>
                              <Link
                                href={`/orders/${order.id}`}
                                className="font-medium text-gray-900 hover:text-blue-600"
                              >
                                {order.orderNumber}
                              </Link>
                              <p className="text-sm text-gray-600">
                                {new Date(order.createdAt).toLocaleDateString(
                                  'ko-KR'
                                )}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">
                                {formatPrice(order.totalAmount)}
                              </p>
                              <span
                                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(order.status)}`}
                              >
                                {getStatusText(order.status)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {/* 빠른 링크 */}
            <Card>
              <CardHeader>
                <CardTitle>빠른 링크</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Link href="/orders">
                    <div className="rounded-lg border border-gray-200 p-4 transition-colors hover:border-gray-300">
                      <div className="flex items-center space-x-3">
                        <div className="rounded-lg bg-blue-100 p-2">
                          <svg
                            className="h-5 w-5 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            주문 내역
                          </h3>
                          <p className="text-sm text-gray-600">
                            주문 현황 확인
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <Link href="/cart">
                    <div className="rounded-lg border border-gray-200 p-4 transition-colors hover:border-gray-300">
                      <div className="flex items-center space-x-3">
                        <div className="rounded-lg bg-green-100 p-2">
                          <svg
                            className="h-5 w-5 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            장바구니
                          </h3>
                          <p className="text-sm text-gray-600">
                            담은 상품 확인
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <Link href="/products">
                    <div className="rounded-lg border border-gray-200 p-4 transition-colors hover:border-gray-300">
                      <div className="flex items-center space-x-3">
                        <div className="rounded-lg bg-purple-100 p-2">
                          <svg
                            className="h-5 w-5 text-purple-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            상품 둘러보기
                          </h3>
                          <p className="text-sm text-gray-600">
                            새로운 상품 탐색
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
