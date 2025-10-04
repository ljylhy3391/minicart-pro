// 아임포트(PortOne) 결제 시스템 설정 및 유틸리티

export interface PaymentRequest {
  merchantUid: string // 주문번호
  amount: number // 결제 금액
  name: string // 상품명
  buyerName?: string // 구매자명
  buyerEmail?: string // 구매자 이메일
  buyerTel?: string // 구매자 전화번호
  buyerAddr?: string // 구매자 주소
  buyerPostcode?: string // 구매자 우편번호
  customData?: Record<string, any> // 커스텀 데이터
}

export interface PaymentResponse {
  success: boolean
  impUid?: string
  merchantUid?: string
  error?: string
  errorCode?: string
}

export interface PaymentMethod {
  value: string
  label: string
  description: string
  icon: string
}

// 지원하는 결제 수단
export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    value: 'card',
    label: '신용카드',
    description: '모든 신용카드 및 체크카드',
    icon: '💳'
  },
  {
    value: 'vbank',
    label: '가상계좌',
    description: '무통장입금',
    icon: '🏦'
  },
  {
    value: 'phone',
    label: '휴대폰',
    description: '휴대폰 소액결제',
    icon: '📱'
  },
  {
    value: 'kakao',
    label: '카카오페이',
    description: '카카오페이 간편결제',
    icon: '💛'
  },
  {
    value: 'naver',
    label: '네이버페이',
    description: '네이버페이 간편결제',
    icon: '🟢'
  },
  {
    value: 'payco',
    label: '페이코',
    description: '페이코 간편결제',
    icon: '🔵'
  },
  {
    value: 'toss',
    label: '토스페이',
    description: '토스페이 간편결제',
    icon: '🔷'
  }
]

// 결제 상태
export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

// 결제 상태 한글 변환
export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: '결제 대기',
  [PaymentStatus.PROCESSING]: '결제 처리중',
  [PaymentStatus.SUCCEEDED]: '결제 완료',
  [PaymentStatus.FAILED]: '결제 실패',
  [PaymentStatus.CANCELLED]: '결제 취소',
  [PaymentStatus.REFUNDED]: '환불 완료'
}

// 결제 상태 색상
export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'text-yellow-600 bg-yellow-100',
  [PaymentStatus.PROCESSING]: 'text-blue-600 bg-blue-100',
  [PaymentStatus.SUCCEEDED]: 'text-green-600 bg-green-100',
  [PaymentStatus.FAILED]: 'text-red-600 bg-red-100',
  [PaymentStatus.CANCELLED]: 'text-gray-600 bg-gray-100',
  [PaymentStatus.REFUNDED]: 'text-purple-600 bg-purple-100'
}

// 아임포트 환경 설정
export const PORTONE_CONFIG = {
  // 개발 환경
  development: {
    storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID_DEV || '',
    apiKey: process.env.PORTONE_API_KEY_DEV || '',
    secretKey: process.env.PORTONE_SECRET_KEY_DEV || ''
  },
  // 운영 환경
  production: {
    storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID_PROD || '',
    apiKey: process.env.PORTONE_API_KEY_PROD || '',
    secretKey: process.env.PORTONE_SECRET_KEY_PROD || ''
  }
}

// 현재 환경에 따른 설정 반환
export function getPortoneConfig() {
  const isDevelopment = process.env.NODE_ENV === 'development'
  return isDevelopment ? PORTONE_CONFIG.development : PORTONE_CONFIG.production
}

// 결제 금액 포맷팅 (원 단위)
export function formatPaymentAmount(amount: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// 결제 수단 아이콘 반환
export function getPaymentMethodIcon(method: string): string {
  const paymentMethod = PAYMENT_METHODS.find(pm => pm.value === method)
  return paymentMethod?.icon || '💳'
}

// 결제 수단 라벨 반환
export function getPaymentMethodLabel(method: string): string {
  const paymentMethod = PAYMENT_METHODS.find(pm => pm.value === method)
  return paymentMethod?.label || '알 수 없음'
}

// 결제 검증을 위한 해시 생성 (서버 사이드에서 사용)
export function generatePaymentHash(merchantUid: string, amount: number, secretKey: string): string {
  const crypto = require('crypto')
  const data = `${merchantUid}:${amount}:${secretKey}`
  return crypto.createHash('sha256').update(data).digest('hex')
}

// 결제 요청 데이터 검증
export function validatePaymentRequest(request: PaymentRequest): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!request.merchantUid) {
    errors.push('주문번호는 필수입니다.')
  }

  if (!request.amount || request.amount <= 0) {
    errors.push('결제 금액은 0보다 커야 합니다.')
  }

  if (!request.name) {
    errors.push('상품명은 필수입니다.')
  }

  if (request.buyerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(request.buyerEmail)) {
    errors.push('올바른 이메일 형식이 아닙니다.')
  }

  if (request.buyerTel && !/^[0-9-+\s()]+$/.test(request.buyerTel)) {
    errors.push('올바른 전화번호 형식이 아닙니다.')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

