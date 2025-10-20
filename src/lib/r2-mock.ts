// R2 설정이 없을 때 사용할 임시 모킹 함수들

export interface UploadResult {
  success: boolean
  imageUrl?: string
  fileName?: string
  error?: string
}

export interface ImageInfo {
  fileName: string
  imageUrl: string
  size: number
  lastModified: Date
}

/**
 * 임시 업로드 함수 (R2 설정이 없을 때 사용)
 */
export async function uploadToR2(
  file: File,
  fileName: string,
  folder: string = 'products'
): Promise<UploadResult> {
  // 실제 R2 설정이 있는지 확인
  if (!process.env.R2_ACCOUNT_ID) {
    console.warn('R2 환경 변수가 설정되지 않았습니다. 임시 모드로 실행됩니다.')

    // 임시로 로컬 URL 반환
    const mockUrl = `https://via.placeholder.com/400x400/cccccc/666666?text=${encodeURIComponent(fileName)}`

    return {
      success: true,
      imageUrl: mockUrl,
      fileName: `${folder}/${fileName}`,
    }
  }

  // 실제 R2 업로드 로직은 원래 r2.ts에서 처리
  throw new Error('R2 설정이 필요합니다.')
}

/**
 * 임시 삭제 함수
 */
export async function deleteFromR2(fileName: string): Promise<boolean> {
  if (!process.env.R2_ACCOUNT_ID) {
    console.warn('R2 환경 변수가 설정되지 않았습니다. 삭제는 무시됩니다.')
    return true
  }

  throw new Error('R2 설정이 필요합니다.')
}

/**
 * 임시 목록 조회 함수
 */
export async function listImagesFromR2(
  folder: string = 'products'
): Promise<ImageInfo[]> {
  if (!process.env.R2_ACCOUNT_ID) {
    console.warn('R2 환경 변수가 설정되지 않았습니다. 빈 목록을 반환합니다.')
    return []
  }

  throw new Error('R2 설정이 필요합니다.')
}

/**
 * 파일명 생성 (원래 함수와 동일)
 */
export function generateFileName(originalName: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 8)
  const extension = originalName.split('.').pop()
  return `${timestamp}-${randomString}.${extension}`
}

/**
 * 이미지 파일 유효성 검사 (원래 함수와 동일)
 */
export function validateImageFile(file: File): {
  valid: boolean
  error?: string
} {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.',
    }
  }

  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size too large. Maximum size is 10MB.',
    }
  }

  return { valid: true }
}
