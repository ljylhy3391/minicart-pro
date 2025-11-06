'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import Link from 'next/link'
import Image from 'next/image'
import { Truck, Star, Shield } from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: {
    id: string
    name: string
  }
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
  createdAt: string
  updatedAt: string
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({})

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/products/${params.id}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('상품을 찾을 수 없습니다.')
        }
        throw new Error('상품을 불러오는데 실패했습니다.')
      }

      const data: Product = await response.json()
      setProduct(data)
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
      fetchProduct()
    }
  }, [params.id])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(price)
  }

  const calculateTotalPrice = () => {
    if (!product) return 0

    let totalPrice = product.price

    // 선택된 변형의 가격 수정자 추가
    product.variants.forEach((variant) => {
      const selectedValue = selectedVariants[variant.name]
      if (selectedValue === variant.value) {
        totalPrice += variant.priceModifier
      }
    })

    return totalPrice * quantity
  }

  const handleAddToCart = async () => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product?.id,
          quantity,
          selectedVariants,
        }),
      })

      if (!response.ok) {
        throw new Error('장바구니에 추가하는데 실패했습니다.')
      }

      alert('장바구니에 추가되었습니다!')
    } catch (err) {
      alert(
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      )
    }
  }

  const handleBuyNow = async () => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [
            {
              productId: product?.id,
              quantity,
              selectedVariants,
            },
          ],
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

  const calculateDiscount = () => {
    if (!product) return 0
    const originalPrice = product.price * 1.2
    const discount = ((originalPrice - product.price) / originalPrice) * 100
    return Math.round(discount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-12">
          <div className="text-lg text-gray-600">상품을 불러오는 중...</div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-md border border-red-200 bg-red-50 p-4">
            <p className="text-red-800">{error}</p>
            <Link href="/products">
              <Button className="mt-4">상품 목록으로 돌아가기</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const discount = calculateDiscount()
  const originalPrice = Math.round(product.price * 1.2)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* 메인 컨텐츠 */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 브레드크럼 */}
        <nav className="mb-6 flex items-center space-x-2 text-sm text-gray-600">
          <Link href="/products" className="hover:text-gray-900">
            상품 목록
          </Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* 상품 이미지 */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-lg border bg-white">
              {product.images.length > 0 ? (
                <Image
                  src={product.images[selectedImageIndex].url}
                  alt={product.images[selectedImageIndex].alt}
                  fill
                  className="rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-lg bg-gray-200">
                  <span className="text-gray-500">이미지 없음</span>
                </div>
              )}
            </div>

            {/* 썸네일 */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square overflow-hidden rounded-md border-2 ${
                      selectedImageIndex === index
                        ? 'border-blue-500'
                        : 'border-gray-200'
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={image.alt}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 상품 정보 */}
          <div className="space-y-6">
            <div>
              {/* 카테고리 & 배송 정보 */}
              <div className="mb-3 flex items-center gap-3">
                <span className="rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-700">
                  {product.category.name}
                </span>
                <div className="flex items-center gap-1 text-coupang">
                  <Truck className="h-4 w-4" />
                  <span className="text-sm font-medium">로켓배송</span>
                </div>
              </div>

              {/* 상품명 */}
              <h1 className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl">
                {product.name}
              </h1>

              {/* 평점 */}
              <div className="mb-4 flex items-center gap-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="h-5 w-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">4.5 (123개 리뷰)</span>
              </div>

              {/* 가격 */}
              <div className="mb-6 space-y-2 border-b border-gray-200 pb-6">
                {discount > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-400 line-through">
                      {formatPrice(originalPrice)}
                    </span>
                    <span className="rounded-md bg-red-50 px-3 py-1 text-lg font-bold text-coupang">
                      {discount}% 할인
                    </span>
                  </div>
                )}
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-gray-900">
                    {formatPrice(calculateTotalPrice())}
                  </span>
                  {quantity > 1 && (
                    <span className="text-sm text-gray-500">
                      (단가: {formatPrice(calculateTotalPrice() / quantity)})
                    </span>
                  )}
                </div>
              </div>

              {/* 배송 및 혜택 정보 */}
              <div className="mb-6 space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-coupang mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">로켓배송</div>
                    <div className="text-sm text-gray-600">
                      내일(토) 1/18 도착 예정
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-coupang mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">로켓와우 회원</div>
                    <div className="text-sm text-gray-600">
                      최대 5% 적립 + 무료배송
                    </div>
                  </div>
                </div>
              </div>

              {/* 상품 설명 */}
              <p className="leading-relaxed text-gray-700">
                {product.description}
              </p>
            </div>

            {/* 상품 변형 */}
            {product.variants.length > 0 && (
              <div className="space-y-4">
                {product.variants
                  .reduce(
                    (acc, variant) => {
                      if (!acc.find((v) => v.name === variant.name)) {
                        acc.push(variant)
                      }
                      return acc
                    },
                    [] as typeof product.variants
                  )
                  .map((variant) => (
                    <div key={variant.name}>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        {variant.name}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {product.variants
                          .filter((v) => v.name === variant.name)
                          .map((v) => (
                            <button
                              key={v.id}
                              onClick={() =>
                                setSelectedVariants((prev) => ({
                                  ...prev,
                                  [variant.name]: v.value,
                                }))
                              }
                              className={`rounded-md border px-4 py-2 text-sm ${
                                selectedVariants[variant.name] === v.value
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}
                            >
                              {v.value}
                              {v.priceModifier > 0 &&
                                ` (+${formatPrice(v.priceModifier)})`}
                              {v.priceModifier < 0 &&
                                ` (${formatPrice(v.priceModifier)})`}
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* 수량 선택 */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                수량
              </label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 hover:bg-gray-50"
                >
                  -
                </button>
                <span className="w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="sticky bottom-0 space-y-3 border-t border-gray-200 bg-white pt-6">
              <Button
                onClick={handleAddToCart}
                className="w-full bg-gray-800 text-white hover:bg-gray-900"
                size="lg"
              >
                장바구니에 담기
              </Button>
              <Button
                onClick={handleBuyNow}
                className="w-full bg-coupang text-white hover:bg-coupang-dark"
                size="lg"
              >
                바로 구매하기
              </Button>
            </div>

            {/* 상품 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">상품 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">상품 ID</span>
                  <span>{product.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">등록일</span>
                  <span>
                    {new Date(product.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">수정일</span>
                  <span>
                    {new Date(product.updatedAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
