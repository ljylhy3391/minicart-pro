'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPaymentAmount } from '@/lib/portone'
import { RefreshCw, AlertTriangle } from 'lucide-react'

interface RefundButtonProps {
  paymentId: string
  amount: number
  isRefundable: boolean
  onRefundSuccess?: () => void
  onRefundError?: (error: string) => void
}

export function RefundButton({
  paymentId,
  amount,
  isRefundable,
  onRefundSuccess,
  onRefundError,
}: RefundButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [refundAmount, setRefundAmount] = useState(amount)
  const [refundReason, setRefundReason] = useState('')

  const handleRefund = async () => {
    if (isLoading) return

    setIsLoading(true)

    try {
      const response = await fetch('/api/payments/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId,
          amount: refundAmount,
          reason: refundReason || '고객 요청',
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        onRefundSuccess?.()
        setShowConfirmModal(false)
        alert('환불이 성공적으로 처리되었습니다.')
      } else {
        throw new Error(result.error || '환불 처리에 실패했습니다.')
      }
    } catch (error) {
      console.error('Refund error:', error)
      const errorMessage =
        error instanceof Error
          ? error.message
          : '환불 처리 중 오류가 발생했습니다.'
      onRefundError?.(errorMessage)
      alert(`환불 오류: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isRefundable) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-orange-700">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">환불할 수 없는 결제입니다.</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="border-red-200 bg-red-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-red-800">환불 요청</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-red-700">
            <p>결제 금액: {formatPaymentAmount(amount)}</p>
            <p className="mt-1 text-xs text-red-600">
              • 환불은 영업일 기준 3-5일 소요됩니다.
            </p>
            <p className="text-xs text-red-600">
              • 환불 후 재고가 자동으로 복원됩니다.
            </p>
          </div>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowConfirmModal(true)}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>처리중...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4" />
                <span>환불 요청</span>
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 환불 확인 모달 */}
      {showConfirmModal && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <Card className="mx-4 w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-red-800">
                환불 확인
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    환불 금액
                  </label>
                  <input
                    type="number"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(Number(e.target.value))}
                    min="0"
                    max={amount}
                    className="w-full rounded-md border p-2"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    최대 환불 가능 금액: {formatPaymentAmount(amount)}
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    환불 사유
                  </label>
                  <textarea
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    placeholder="환불 사유를 입력해주세요 (선택사항)"
                    className="h-20 w-full resize-none rounded-md border p-2"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1"
                  disabled={isLoading}
                >
                  취소
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleRefund}
                  className="flex-1"
                  disabled={
                    isLoading || refundAmount <= 0 || refundAmount > amount
                  }
                >
                  {isLoading
                    ? '처리중...'
                    : `${formatPaymentAmount(refundAmount)} 환불하기`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
