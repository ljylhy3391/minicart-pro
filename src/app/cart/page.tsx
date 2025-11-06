'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserMenu } from '@/components/auth/user-menu'
import Link from 'next/link'
import Image from 'next/image'

interface CartItem {
  id: string
  quantity: number
  selectedVariants: string | null
  product: {
    id: string
    name: string
    description: string
    price: number
    images: {
      id: string
      url: string
      alt: string
    }[]
    variants: {
      id: string
      name: string
      value: string
      priceModifier: number
    }[]
  }
}

interface Cart {
  id: string | null
  items: CartItem[]
}

export default function CartPage() {
  const router = useRouter()
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set())

  const fetchCart = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/cart')

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/signin')
          return
        }
        throw new Error('장바구니를 불러오는데 실패했습니다.')
      }

      const data = await response.json()
      
      // 카트가 없거나 에러가 있는 경우 처리
      if (data.error) {
        throw new Error(data.error)
      }
      
      // 빈 카트 객체 처리
      if (!data || !data.items) {
        setCart({ id: null, items: [] })
      } else {
        setCart(data)
      }
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
    fetchCart()
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(price)
  }

  const calculateItemPrice = (item: CartItem) => {
    let price = item.product.price

    if (item.selectedVariants) {
      const variants = JSON.parse(item.selectedVariants)
      item.product.variants.forEach((variant) => {
        if (variants[variant.name] === variant.value) {
          price += variant.priceModifier
        }
      })
    }

    return price * item.quantity
  }

  const calculateTotalPrice = () => {
    if (!cart) return 0
    return cart.items.reduce(
      (total, item) => total + calculateItemPrice(item),
      0
    )
  }

  const updateItemQuantity = async (itemId: string, newQuantity: number) => {
    try {
      setUpdatingItems((prev) => new Set(prev).add(itemId))

      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId,
          quantity: newQuantity,
        }),
      })

      if (!response.ok) {
        throw new Error('수량을 변경하는데 실패했습니다.')
      }

      await fetchCart()
    } catch (err) {
      alert(
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      )
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev)
        newSet.delete(itemId)
        return newSet
      })
    }
  }

  const removeItem = async (itemId: string) => {
    if (!confirm('정말로 이 상품을 장바구니에서 제거하시겠습니까?')) {
      return
    }

    try {
      setUpdatingItems((prev) => new Set(prev).add(itemId))

      const response = await fetch(`/api/cart?itemId=${itemId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('상품을 제거하는데 실패했습니다.')
      }

      await fetchCart()
    } catch (err) {
      alert(
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      )
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev)
        newSet.delete(itemId)
        return newSet
      })
    }
  }

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) {
      alert('장바구니가 비어있습니다.')
      return
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart.items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            selectedVariants: item.selectedVariants
              ? JSON.parse(item.selectedVariants)
              : {},
          })),
        }),
      })

      if (!response.ok) {
        throw new Error('주문을 생성하는데 실패했습니다.')
      }

      const order = await response.json()
      router.push(`/orders/${order.id}`)
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
          <div className="text-lg text-gray-600">장바구니를 불러오는 중...</div>
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
                <Link href="/cart" className="font-medium text-gray-900">
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
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">장바구니</h1>
          <Link href="/products">
            <Button variant="outline">쇼핑 계속하기</Button>
          </Link>
        </div>

        {!cart || cart.items.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mb-4 text-6xl text-gray-400">🛒</div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              장바구니가 비어있습니다
            </h2>
            <p className="mb-6 text-gray-600">
              원하는 상품을 장바구니에 추가해보세요
            </p>
            <Link href="/products">
              <Button>상품 둘러보기</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* 장바구니 아이템 목록 */}
            <div className="space-y-4 lg:col-span-2">
              {cart.items.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex">
                      <div className="relative h-24 w-24 flex-shrink-0">
                        {item.product.images.length > 0 ? (
                          <Image
                            src={item.product.images[0].url}
                            alt={item.product.images[0].alt}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gray-200">
                            <span className="text-xs text-gray-500">
                              이미지 없음
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="mb-1 font-semibold text-gray-900">
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

                            <div className="text-lg font-bold text-gray-900">
                              {formatPrice(calculateItemPrice(item))}
                            </div>
                          </div>

                          <div className="flex flex-col items-end space-y-2">
                            {/* 수량 조절 */}
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() =>
                                  updateItemQuantity(item.id, item.quantity - 1)
                                }
                                disabled={updatingItems.has(item.id)}
                                className="flex h-6 w-6 items-center justify-center rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                              >
                                -
                              </button>
                              <span className="w-8 text-center text-sm">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateItemQuantity(item.id, item.quantity + 1)
                                }
                                disabled={updatingItems.has(item.id)}
                                className="flex h-6 w-6 items-center justify-center rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                              >
                                +
                              </button>
                            </div>

                            {/* 삭제 버튼 */}
                            <button
                              onClick={() => removeItem(item.id)}
                              disabled={updatingItems.has(item.id)}
                              className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                            >
                              삭제
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 주문 요약 */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>주문 요약</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>상품 수량</span>
                    <span>{cart.items.length}개</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>총 수량</span>
                    <span>
                      {cart.items.reduce((sum, item) => sum + item.quantity, 0)}
                      개
                    </span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>총 금액</span>
                      <span>{formatPrice(calculateTotalPrice())}</span>
                    </div>
                  </div>

                  <Button onClick={handleCheckout} className="w-full" size="lg">
                    주문하기
                  </Button>

                  <div className="text-center text-xs text-gray-500">
                    주문하기 버튼을 클릭하면 주문 페이지로 이동합니다
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
