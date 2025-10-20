import { UserMenu } from '@/components/auth/user-menu'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Minicart Pro</h1>
            </div>
            <div className="flex items-center space-x-4">
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">
            미니 커머스에 오신 것을 환영합니다
          </h2>
          <p className="mb-8 text-lg text-gray-600">전자상거래 플랫폼</p>

          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/products"
              className="rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 text-4xl">🛍️</div>
              <h3 className="mb-2 text-lg font-semibold">상품 둘러보기</h3>
              <p className="text-gray-600">다양한 상품을 탐색하고 구매하세요</p>
            </Link>
            <Link
              href="/cart"
              className="rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 text-4xl">🛒</div>
              <h3 className="mb-2 text-lg font-semibold">장바구니</h3>
              <p className="text-gray-600">담은 상품을 확인하고 주문하세요</p>
            </Link>
            <Link
              href="/orders"
              className="rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 text-4xl">📦</div>
              <h3 className="mb-2 text-lg font-semibold">주문 내역</h3>
              <p className="text-gray-600">주문 현황을 확인하고 관리하세요</p>
            </Link>
            <Link
              href="/profile"
              className="rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 text-4xl">👤</div>
              <h3 className="mb-2 text-lg font-semibold">프로필</h3>
              <p className="text-gray-600">
                계정 정보와 구매 통계를 확인하세요
              </p>
            </Link>
            <Link
              href="/admin/products"
              className="rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 text-4xl">⚙️</div>
              <h3 className="mb-2 text-lg font-semibold">관리자</h3>
              <p className="text-gray-600">상품 관리 및 이미지 업로드</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
