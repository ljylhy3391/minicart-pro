'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserMenu } from '@/components/auth/user-menu'
import Link from 'next/link'
import Image from 'next/image'

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
          <div className="text-lg text-gray-600">상품을 불러오는 중...</div>
        </div>
      </div>
    )
  }

  if (error || !product) {
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
            <Link href="/products">
              <Button className="mt-4">상품 목록으로 돌아가기</Button>
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
                <Link href="/products" className="font-medium text-gray-900">
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
              <div className="mb-2">
                <span className="rounded bg-blue-50 px-2 py-1 text-sm text-blue-600">
                  {product.category.name}
                </span>
              </div>
              <h1 className="mb-4 text-3xl font-bold text-gray-900">
                {product.name}
              </h1>
              <div className="mb-4 text-3xl font-bold text-gray-900">
                {formatPrice(calculateTotalPrice())}
              </div>
              <p className="leading-relaxed text-gray-600">
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
            <div className="flex space-x-4">
              <Button onClick={handleAddToCart} className="flex-1" size="lg">
                장바구니에 추가
              </Button>
              <Button
                onClick={handleBuyNow}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                바로 구매
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
