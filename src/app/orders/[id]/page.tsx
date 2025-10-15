'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserMenu } from '@/components/auth/user-menu'
import { PaymentModal } from '@/components/payment/payment-modal'
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
    description: string
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
  paymentMethod: string | null
  paymentStatus: string | null
  createdAt: string
  updatedAt: string
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/orders/${params.id}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('주문을 찾을 수 없습니다.')
        }
        if (response.status === 401) {
          router.push('/auth/signin')
          return
        }
        throw new Error('주문을 불러오는데 실패했습니다.')
      }

      const data: Order = await response.json()
      setOrder(data)
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
    if (params.id) {
      fetchOrder()
    }
  }, [params.id])

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

  const getPaymentStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      PENDING: '결제 대기',
      COMPLETED: '결제 완료',
      FAILED: '결제 실패',
      CANCELLED: '결제 취소',
      REFUNDED: '환불 완료',
    }
    return statusMap[status] || status
  }

  const getPaymentStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
      REFUNDED: 'bg-blue-100 text-blue-800',
    }
    return colorMap[status] || 'bg-gray-100 text-gray-800'
  }

  const handleCancelOrder = async () => {
    if (!confirm('정말로 이 주문을 취소하시겠습니까?')) {
      return
    }

    try {
      const response = await fetch(`/api/orders/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'CANCELLED',
        }),
      })

      if (!response.ok) {
        throw new Error('주문을 취소하는데 실패했습니다.')
      }

      alert('주문이 취소되었습니다.')
      await fetchOrder()
    } catch (err) {
      alert(
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="border-b bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <Link href="/orders" className="text-xl font-bold text-gray-900">
                Minicart Pro
              </Link>
              <UserMenu />
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center py-12">
          <div className="text-lg text-gray-600">주문을 불러오는 중...</div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="border-b bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <Link href="/orders" className="text-xl font-bold text-gray-900">
                Minicart Pro
              </Link>
              <UserMenu />
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-md border border-red-200 bg-red-50 p-4">
            <p className="text-red-800">{error}</p>
            <Link href="/orders">
              <Button className="mt-4">주문 목록으로 돌아가기</Button>
            </Link>
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
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 브레드크럼 */}
        <nav className="mb-6 flex items-center space-x-2 text-sm text-gray-600">
          <Link href="/orders" className="hover:text-gray-900">
            주문 내역
          </Link>
          <span>/</span>
          <span className="text-gray-900">{order.orderNumber}</span>
        </nav>

        <div className="space-y-6">
          {/* 주문 정보 */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">
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
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(order.status)}`}
                  >
                    {getStatusText(order.status)}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <h3 className="mb-2 font-semibold text-gray-900">
                    결제 정보
                  </h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">결제 수단</span>
                      <span>{order.paymentMethod || '미설정'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">결제 상태</span>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getPaymentStatusColor(order.paymentStatus || 'PENDING')}`}
                      >
                        {getPaymentStatusText(order.paymentStatus || 'PENDING')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">총 금액</span>
                      <span className="font-semibold">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 font-semibold text-gray-900">
                    배송 정보
                  </h3>
                  <div className="text-sm text-gray-600">
                    {order.shippingAddress || '배송지 정보가 없습니다.'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 주문 아이템들 */}
          <Card>
            <CardHeader>
              <CardTitle>주문 상품</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start space-x-4 border-b border-gray-100 py-4 last:border-b-0"
                  >
                    <div className="relative h-20 w-20 flex-shrink-0">
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
                      <p className="mb-2 line-clamp-2 text-sm text-gray-600">
                        {item.product.description}
                      </p>

                      {/* 선택된 변형 표시 */}
                      {item.selectedVariants && (
                        <div className="mb-2 text-xs text-gray-500">
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
              </div>
            </CardContent>
          </Card>

          {/* 액션 버튼 */}
          <div className="flex justify-end space-x-3">
            <Link href="/orders">
              <Button variant="outline">주문 목록으로</Button>
            </Link>

            {order.status === 'DELIVERED' && (
              <Button variant="outline">리뷰 작성</Button>
            )}

            {order.status === 'PENDING' && (
              <Button onClick={() => setShowPaymentModal(true)}>
                결제하기
              </Button>
            )}

            {['PENDING', 'CONFIRMED'].includes(order.status) && (
              <Button variant="outline" onClick={handleCancelOrder}>
                주문 취소
              </Button>
            )}
          </div>
        </div>
      </main>

      {/* 결제 모달 */}
      {order && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          orderId={order.id}
          amount={order.totalAmount}
          productName={
            order.items.length === 1
              ? order.items[0].product.name
              : `${order.items[0].product.name} 외 ${order.items.length - 1}개`
          }
          onPaymentSuccess={() => {
            setShowPaymentModal(false)
            fetchOrder() // 주문 정보 새로고침
          }}
        />
      )}
    </div>
  )
}
