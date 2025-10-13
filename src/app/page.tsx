import { UserMenu } from "@/components/auth/user-menu";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            미니 커머스에 오신 것을 환영합니다
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            포트폴리오용 전자상거래 플랫폼
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-2">상품 관리</h3>
              <p className="text-gray-600">다양한 상품을 관리하고 판매하세요</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-2">주문 처리</h3>
              <p className="text-gray-600">효율적인 주문 관리 시스템</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-2">결제 시스템</h3>
              <p className="text-gray-600">안전한 아임포트 결제 연동</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}