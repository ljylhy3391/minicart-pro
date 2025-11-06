import { Header } from '@/components/layout/header'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* 메인 컨텐츠 */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 히어로 섹션 */}
        <div className="mb-12 rounded-lg bg-gradient-to-r from-coupang to-coupang-light p-12 text-center text-white">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            미니 커머스에 오신 것을 환영합니다
          </h1>
          <p className="mb-8 text-xl opacity-90">
            최고의 상품을 합리적인 가격에 만나보세요
          </p>
          <Link
            href="/products"
            className="inline-block rounded-md bg-white px-8 py-3 font-semibold text-coupang transition-transform hover:scale-105"
          >
            쇼핑 시작하기
          </Link>
        </div>

        {/* 빠른 링크 */}
        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">빠른 메뉴</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
            <Link
              href="/products"
              className="group rounded-lg border bg-white p-6 text-center shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <div className="mb-3 text-4xl">🛍️</div>
              <h3 className="font-semibold text-gray-900 group-hover:text-coupang transition-colors">
                상품 둘러보기
              </h3>
            </Link>
            <Link
              href="/cart"
              className="group rounded-lg border bg-white p-6 text-center shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <div className="mb-3 text-4xl">🛒</div>
              <h3 className="font-semibold text-gray-900 group-hover:text-coupang transition-colors">
                장바구니
              </h3>
            </Link>
            <Link
              href="/orders"
              className="group rounded-lg border bg-white p-6 text-center shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <div className="mb-3 text-4xl">📦</div>
              <h3 className="font-semibold text-gray-900 group-hover:text-coupang transition-colors">
                주문 내역
              </h3>
            </Link>
            <Link
              href="/profile"
              className="group rounded-lg border bg-white p-6 text-center shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <div className="mb-3 text-4xl">👤</div>
              <h3 className="font-semibold text-gray-900 group-hover:text-coupang transition-colors">
                프로필
              </h3>
            </Link>
            <Link
              href="/admin/products"
              className="group rounded-lg border bg-white p-6 text-center shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <div className="mb-3 text-4xl">⚙️</div>
              <h3 className="font-semibold text-gray-900 group-hover:text-coupang transition-colors">
                관리자
              </h3>
            </Link>
          </div>
        </div>

        {/* 인기 상품 섹션 */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">인기 상품</h2>
            <Link
              href="/products"
              className="text-coupang hover:text-coupang-dark font-medium"
            >
              전체보기 →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* 인기 상품 카드들은 상품 목록 페이지와 동일한 스타일로 표시 */}
            <div className="text-center text-gray-600">
              상품 목록 페이지에서 확인하세요
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
