'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserMenu } from '@/components/auth/user-menu'
import Link from 'next/link'
import Image from 'next/image'

interface OrderItem {
  id: string
  quantity: number
  price: number
  selectedVariants: string | null
  product: {
    id: string
    name: string
    images: {
      id: string
      url: string
      alt: string
    }[]
  }
}

interface Order {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  items: OrderItem[]
  shippingAddress: string | null
  createdAt: string
  updatedAt: string
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/orders')

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/signin')
          return
        }
        throw new Error('주문 내역을 불러오는데 실패했습니다.')
      }

      const data = await response.json()
      setOrders(data.orders || data)
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
    fetchOrders()
  }, [])

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

  if (loading) {
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
          <div className="text-lg text-gray-600">
            주문 내역을 불러오는 중...
          </div>
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
                <Link href="/orders" className="font-medium text-gray-900">
                  주문내역
                </Link>
              </nav>
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">주문 내역</h1>
          <Link href="/products">
            <Button variant="outline">쇼핑 계속하기</Button>
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mb-4 text-6xl text-gray-400">📦</div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              주문 내역이 없습니다
            </h2>
            <p className="mb-6 text-gray-600">첫 주문을 시작해보세요</p>
            <Link href="/products">
              <Button>상품 둘러보기</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        주문번호: {order.orderNumber}
                      </CardTitle>
                      <p className="mt-1 text-sm text-gray-600">
                        주문일:{' '}
                        {new Date(order.createdAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        {formatPrice(order.totalAmount)}
                      </div>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(order.status)}`}
                      >
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* 주문 아이템들 */}
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center space-x-4 border-b border-gray-100 py-3 last:border-b-0"
                      >
                        <div className="relative h-16 w-16 flex-shrink-0">
                          {item.product.images.length > 0 ? (
                            <Image
                              src={item.product.images[0].url}
                              alt={item.product.images[0].alt}
                              fill
                              className="rounded-md object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center rounded-md bg-gray-200">
                              <span className="text-xs text-gray-500">
                                이미지 없음
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <h3 className="mb-1 font-medium text-gray-900">
                            <Link
                              href={`/products/${item.product.id}`}
                              className="hover:text-blue-600"
                            >
                              {item.product.name}
                            </Link>
                          </h3>

                          {/* 선택된 변형 표시 */}
                          {item.selectedVariants && (
                            <div className="mb-1 text-xs text-gray-500">
                              {Object.entries(
                                JSON.parse(item.selectedVariants)
                              ).map(([key, value]) => (
                                <span key={key} className="mr-2">
                                  {key}: {value}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              수량: {item.quantity}개
                            </span>
                            <span className="font-medium text-gray-900">
                              {formatPrice(item.price)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* 주문 액션 */}
                    <div className="flex justify-end space-x-3 pt-4">
                      <Link href={`/orders/${order.id}`}>
                        <Button variant="outline" size="sm">
                          상세보기
                        </Button>
                      </Link>

                      {order.status === 'DELIVERED' && (
                        <Button variant="outline" size="sm">
                          리뷰 작성
                        </Button>
                      )}

                      {['PENDING', 'CONFIRMED'].includes(order.status) && (
                        <Button variant="outline" size="sm">
                          주문 취소
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
