'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  PaymentRequest,
  PaymentResponse,
  PAYMENT_METHODS,
  formatPaymentAmount,
  getPaymentMethodIcon,
  getPaymentMethodLabel,
} from '@/lib/portone'

interface PaymentButtonProps {
  orderId: string
  amount: number
  productName: string
  buyerInfo?: {
    name?: string
    email?: string
    phone?: string
    address?: string
  }
  onPaymentSuccess?: (response: PaymentResponse) => void
  onPaymentError?: (error: string) => void
  className?: string
}

export function PaymentButton({
  orderId,
  amount,
  productName,
  buyerInfo,
  onPaymentSuccess,
  onPaymentError,
  className,
}: PaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<string>('card')

  const handlePayment = async () => {
    if (isLoading) return

    setIsLoading(true)

    try {
      // 아임포트 SDK 동적 로드
      const { PortOne } = await import('@portone/browser-sdk/v2')

      // 아임포트 초기화
      await PortOne.load({
        storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID_DEV || '',
      })

      // 결제 요청 데이터
      const paymentRequest: PaymentRequest = {
        merchantUid: orderId,
        amount: amount,
        name: productName,
        buyerName: buyerInfo?.name,
        buyerEmail: buyerInfo?.email,
        buyerTel: buyerInfo?.phone,
        buyerAddr: buyerInfo?.address,
      }

      // 결제 요청
      const response = await PortOne.requestPayment({
        storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID_DEV || '',
        channelKey: 'channel-key-for-test', // 테스트용 채널 키
        paymentId: `payment_${Date.now()}`,
        orderName: productName,
        totalAmount: amount,
        currency: 'KRW',
        payMethod: selectedMethod as any,
        customer: {
          fullName: buyerInfo?.name,
          email: buyerInfo?.email,
          phoneNumber: buyerInfo?.phone,
        },
        confirmUrl: `${window.location.origin}/api/payments/confirm`,
        redirectUrl: `${window.location.origin}/orders/${orderId}?payment=success`,
      })

      if (response.code === 'PAYMENT_SUCCESS') {
        // 결제 성공 시 서버에 결제 정보 전송
        const serverResponse = await fetch('/api/payments/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentId: response.paymentId,
            orderId: orderId,
            amount: amount,
            status: 'SUCCEEDED',
          }),
        })

        if (serverResponse.ok) {
          const paymentResult = await serverResponse.json()
          onPaymentSuccess?.(paymentResult)
        } else {
          throw new Error('결제 검증에 실패했습니다.')
        }
      } else {
        throw new Error(response.message || '결제에 실패했습니다.')
      }
    } catch (error) {
      console.error('Payment error:', error)
      onPaymentError?.(
        error instanceof Error ? error.message : '결제 중 오류가 발생했습니다.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold">결제 정보</h3>
          <p className="text-primary text-2xl font-bold">
            {formatPaymentAmount(amount)}
          </p>
        </div>

        {/* 결제 수단 선택 */}
        <div className="space-y-3">
          <h4 className="font-medium">결제 수단</h4>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map((method) => (
              <button
                key={method.value}
                onClick={() => setSelectedMethod(method.value)}
                className={`rounded-lg border-2 p-3 transition-colors ${
                  selectedMethod === method.value
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{method.icon}</span>
                  <div className="text-left">
                    <div className="text-sm font-medium">{method.label}</div>
                    <div className="text-xs text-gray-500">
                      {method.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 결제 버튼 */}
        <Button
          onClick={handlePayment}
          disabled={isLoading}
          className="h-12 w-full text-lg font-semibold"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>결제 처리 중...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span>{getPaymentMethodIcon(selectedMethod)}</span>
              <span>{getPaymentMethodLabel(selectedMethod)}로 결제하기</span>
            </div>
          )}
        </Button>

        <div className="text-center text-xs text-gray-500">
          <p>• 결제는 아임포트(PortOne)를 통해 안전하게 처리됩니다.</p>
          <p>• 테스트 환경에서는 실제 결제가 이루어지지 않습니다.</p>
        </div>
      </div>
    </Card>
  )
}
