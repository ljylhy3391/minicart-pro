'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PaymentButton } from './payment-button'
import { formatPaymentAmount } from '@/lib/portone'
import { X, ShoppingCart, CreditCard } from 'lucide-react'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  orderId: string
  amount: number
  productName: string
  onPaymentSuccess?: () => void
}

export function PaymentModal({
  isOpen,
  onClose,
  orderId,
  amount,
  productName,
  onPaymentSuccess,
}: PaymentModalProps) {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const handlePaymentSuccess = () => {
    onPaymentSuccess?.()
    onClose()
  }

  const handlePaymentError = (error: string) => {
    alert(`결제 오류: ${error}`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 모달 컨텐츠 */}
      <div className="relative mx-4 w-full max-w-md">
        <Card className="overflow-hidden p-0">
          {/* 헤더 */}
          <div className="flex items-center justify-between border-b p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 rounded-lg p-2">
                <CreditCard className="text-primary h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">결제하기</h2>
                <p className="text-sm text-gray-500">
                  안전한 결제를 진행해주세요
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* 결제 정보 */}
          <div className="space-y-4 p-6">
            {/* 주문 정보 */}
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="mb-2 flex items-center space-x-2">
                <ShoppingCart className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  주문 정보
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">{productName}</p>
                <p className="text-primary text-lg font-bold">
                  {formatPaymentAmount(amount)}
                </p>
              </div>
            </div>

            {/* 구매자 정보 */}
            {session?.user && (
              <div className="rounded-lg bg-blue-50 p-4">
                <h4 className="mb-2 text-sm font-medium text-blue-900">
                  구매자 정보
                </h4>
                <div className="space-y-1 text-sm text-blue-800">
                  <p>이름: {session.user.name || '정보 없음'}</p>
                  <p>이메일: {session.user.email}</p>
                </div>
              </div>
            )}

            {/* 결제 버튼 */}
            <PaymentButton
              orderId={orderId}
              amount={amount}
              productName={productName}
              buyerInfo={{
                name: session?.user?.name || undefined,
                email: session?.user?.email || undefined,
              }}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
              className="border-0 shadow-none"
            />
          </div>

          {/* 푸터 */}
          <div className="border-t bg-gray-50 px-6 py-4">
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>SSL 보안 결제</span>
              <span>•</span>
              <span>아임포트(PortOne) 보안</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
