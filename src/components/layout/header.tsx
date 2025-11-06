'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { UserMenu } from '@/components/auth/user-menu'
import { Search, ShoppingCart, Menu } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Category {
  id: string
  name: string
  slug: string
}

export function Header() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const router = useRouter()

  useEffect(() => {
    // 카테고리 목록 가져오기
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) {
          setCategories(data.categories)
        }
      })
      .catch((err) => console.error('Failed to fetch categories:', err))
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      router.push('/products')
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* 상단 헤더 */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            {/* 로고 */}
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-coupang">Minicart</span>
            </Link>

            {/* 검색바 */}
            <form
              onSubmit={handleSearch}
              className="hidden flex-1 max-w-2xl mx-8 md:block"
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="찾고 싶은 상품을 검색해보세요"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-4 py-2.5 pr-12 text-sm focus:border-coupang focus:outline-none focus:ring-2 focus:ring-coupang/20"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-coupang p-2 text-white hover:bg-coupang-dark transition-colors"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </form>

            {/* 우측 메뉴 */}
            <div className="flex items-center space-x-4">
              <Link
                href="/cart"
                className="relative flex items-center space-x-1 text-gray-700 hover:text-coupang transition-colors"
              >
                <ShoppingCart className="h-6 w-6" />
                <span className="hidden sm:inline text-sm">장바구니</span>
              </Link>
              <UserMenu />
            </div>
          </div>
        </div>
      </div>

      {/* 카테고리 메뉴 */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex h-12 items-center space-x-6 overflow-x-auto">
            <Link
              href="/products"
              className="flex items-center space-x-1 whitespace-nowrap text-sm font-medium text-gray-700 hover:text-coupang transition-colors"
            >
              <Menu className="h-4 w-4" />
              <span>전체 카테고리</span>
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="whitespace-nowrap text-sm text-gray-600 hover:text-coupang transition-colors"
              >
                {category.name}
              </Link>
            ))}
            <Link
              href="/orders"
              className="whitespace-nowrap text-sm text-gray-600 hover:text-coupang transition-colors"
            >
              주문내역
            </Link>
          </nav>
        </div>
      </div>

      {/* 모바일 검색바 */}
      <div className="border-b border-gray-200 bg-white md:hidden">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="상품 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-4 py-2 pr-12 text-sm focus:border-coupang focus:outline-none focus:ring-2 focus:ring-coupang/20"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-coupang p-2 text-white hover:bg-coupang-dark transition-colors"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}

