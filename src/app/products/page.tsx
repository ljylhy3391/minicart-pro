'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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

  const fetchProducts = async (page = 1, search = '') => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      })

      if (search) {
        params.append('search', search)
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
    fetchProducts(pagination.page, searchQuery)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchProducts(1, searchQuery)
  }

  const handlePageChange = (newPage: number) => {
    fetchProducts(newPage, searchQuery)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(price)
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

      {/* 검색 및 필터 */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="상품명 또는 설명으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button type="submit">검색</Button>
          </form>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">상품 목록</h1>
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
            <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className="overflow-hidden transition-shadow hover:shadow-lg"
                >
                  <CardHeader className="p-0">
                    <div className="relative aspect-square">
                      {product.images.length > 0 ? (
                        <Image
                          src={product.images[0].url}
                          alt={product.images[0].alt}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-200">
                          <span className="text-gray-500">이미지 없음</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="mb-2">
                      <span className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-600">
                        {product.category.name}
                      </span>
                    </div>
                    <CardTitle className="mb-2 line-clamp-2 text-lg">
                      {product.name}
                    </CardTitle>
                    <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                      {product.description}
                    </p>
                    <div className="text-xl font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Link href={`/products/${product.id}`} className="w-full">
                      <Button className="w-full">상세보기</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* 페이지네이션 */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
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
                        variant={
                          pageNum === pagination.page ? 'default' : 'outline'
                        }
                        onClick={() => handlePageChange(pageNum)}
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
