'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import Link from 'next/link'
import Image from 'next/image'
import { Truck, Star } from 'lucide-react'

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
}

interface ProductsResponse {
  products: Product[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<{
    name: string
    slug: string
  } | null>(null)

  const categorySlug = searchParams.get('category')

  const fetchProducts = async (page = 1, search = '', category = null) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      })

      if (search) {
        params.append('search', search)
      }

      if (category) {
        params.append('category', category)
      }

      const response = await fetch(`/api/products?${params}`)

      if (!response.ok) {
        throw new Error('상품을 불러오는데 실패했습니다.')
      }

      const data: ProductsResponse = await response.json()
      setProducts(data.products)
      setPagination(data.pagination)
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
    // 카테고리 정보 가져오기
    if (categorySlug) {
      fetch('/api/categories')
        .then((res) => res.json())
        .then((data) => {
          if (data.categories) {
            const category = data.categories.find(
              (cat: { slug: string }) => cat.slug === categorySlug
            )
            if (category) {
              setSelectedCategory({ name: category.name, slug: category.slug })
            }
          }
        })
        .catch((err) => console.error('Failed to fetch category:', err))
    } else {
      setSelectedCategory(null)
    }
  }, [categorySlug])

  useEffect(() => {
    fetchProducts(pagination.page, searchQuery, categorySlug)
  }, [categorySlug, searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchProducts(1, searchQuery, categorySlug)
  }

  const handlePageChange = (newPage: number) => {
    fetchProducts(newPage, searchQuery, categorySlug)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(price)
  }

  // 할인율 계산 (예시: 원가의 10-30% 할인)
  const calculateDiscount = (price: number) => {
    const originalPrice = price * 1.2 // 원가를 가격의 120%로 가정
    const discount = ((originalPrice - price) / originalPrice) * 100
    return Math.round(discount)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* 메인 컨텐츠 */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {searchQuery
                ? `"${searchQuery}" 검색 결과`
                : selectedCategory
                  ? selectedCategory.name
                  : '전체 상품'}
            </h1>
            {selectedCategory && (
              <Link
                href="/products"
                className="mt-1 text-sm text-gray-500 hover:text-coupang"
              >
                ← 전체 상품 보기
              </Link>
            )}
          </div>
          <p className="text-gray-600">총 {pagination.total}개의 상품</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-lg text-gray-600">상품을 불러오는 중...</div>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-lg text-gray-600">상품이 없습니다.</p>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <>
            {/* 상품 그리드 */}
            <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {products.map((product) => {
                const discount = calculateDiscount(product.price)
                const originalPrice = Math.round(product.price * 1.2)

                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="group"
                  >
                    <Card className="overflow-hidden border-gray-200 bg-white transition-all hover:shadow-xl hover:-translate-y-1">
                      <CardHeader className="relative p-0">
                        <div className="relative aspect-square bg-gray-100">
                          {product.images.length > 0 ? (
                            <Image
                              src={product.images[0].url}
                              alt={product.images[0].alt}
                              fill
                              className="object-cover transition-transform group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gray-200">
                              <span className="text-sm text-gray-500">
                                이미지 없음
                              </span>
                            </div>
                          )}
                          {/* 할인율 배지 */}
                          {discount > 0 && (
                            <div className="absolute left-2 top-2 rounded-md bg-coupang px-2 py-1 text-xs font-bold text-white">
                              {discount}%
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="p-3">
                        {/* 배송 정보 */}
                        <div className="mb-2 flex items-center gap-1">
                          <Truck className="h-3 w-3 text-coupang" />
                          <span className="text-xs font-medium text-coupang">
                            로켓배송
                          </span>
                        </div>

                        {/* 상품명 */}
                        <h3 className="mb-2 line-clamp-2 text-sm font-medium text-gray-900 group-hover:text-coupang transition-colors">
                          {product.name}
                        </h3>

                        {/* 가격 */}
                        <div className="space-y-1">
                          {discount > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400 line-through">
                                {formatPrice(originalPrice)}
                              </span>
                              <span className="rounded bg-red-50 px-1.5 py-0.5 text-xs font-bold text-coupang">
                                {discount}%
                              </span>
                            </div>
                          )}
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold text-gray-900">
                              {formatPrice(product.price)}
                            </span>
                          </div>
                        </div>

                        {/* 평점 (예시) */}
                        <div className="mt-2 flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-gray-600">
                            4.5 (123)
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>

            {/* 페이지네이션 */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                >
                  이전
                </Button>

                {Array.from(
                  { length: Math.min(5, pagination.pages) },
                  (_, i) => {
                    const pageNum = Math.max(1, pagination.page - 2) + i
                    if (pageNum > pagination.pages) return null

                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === pagination.page ? 'default' : 'outline'}
                        onClick={() => handlePageChange(pageNum)}
                        className={
                          pageNum === pagination.page
                            ? 'bg-coupang text-white hover:bg-coupang-dark'
                            : 'border-gray-300 hover:bg-gray-50'
                        }
                      >
                        {pageNum}
                      </Button>
                    )
                  }
                )}

                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                >
                  다음
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
