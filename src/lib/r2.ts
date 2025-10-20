import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Cloudflare R2 클라이언트 설정
const ACCOUNT_ID =
  process.env.R2_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID
const ACCESS_KEY_ID =
  process.env.R2_ACCESS_KEY_ID || process.env.CLOUDFLARE_ACCESS_KEY_ID
const SECRET_ACCESS_KEY =
  process.env.R2_SECRET_ACCESS_KEY || process.env.CLOUDFLARE_SECRET_ACCESS_KEY
const BUCKET_NAME = (process.env.R2_BUCKET_NAME ||
  process.env.CLOUDFLARE_BUCKET_NAME)!
const PUBLIC_URL = (process.env.R2_PUBLIC_URL ||
  process.env.CLOUDFLARE_PUBLIC_URL)!

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY_ID!,
    secretAccessKey: SECRET_ACCESS_KEY!,
  },
})

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
 * 파일을 Cloudflare R2에 업로드
 */
export async function uploadToR2(
  file: File,
  fileName: string,
  folder: string = 'products'
): Promise<UploadResult> {
  try {
    const key = `${folder}/${fileName}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      Metadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    })

    await r2Client.send(command)

    const imageUrl = `${PUBLIC_URL}/${key}`

    return {
      success: true,
      imageUrl,
      fileName: key,
    }
  } catch (error) {
    console.error('R2 upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    }
  }
}

/**
 * R2에서 파일 삭제
 */
export async function deleteFromR2(fileName: string): Promise<boolean> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
    })

    await r2Client.send(command)
    return true
  } catch (error) {
    console.error('R2 delete error:', error)
    return false
  }
}

/**
 * R2에서 이미지 목록 조회
 */
export async function listImagesFromR2(
  folder: string = 'products'
): Promise<ImageInfo[]> {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: `${folder}/`,
    })

    const response = await r2Client.send(command)

    if (!response.Contents) {
      return []
    }

    return response.Contents.map((object) => ({
      fileName: object.Key!,
      imageUrl: `${PUBLIC_URL}/${object.Key}`,
      size: object.Size || 0,
      lastModified: object.LastModified || new Date(),
    }))
  } catch (error) {
    console.error('R2 list error:', error)
    return []
  }
}

/**
 * 파일명 생성 (중복 방지)
 */
export function generateFileName(originalName: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 8)
  const extension = originalName.split('.').pop()
  return `${timestamp}-${randomString}.${extension}`
}

/**
 * 이미지 파일 유효성 검사
 */
export function validateImageFile(file: File): {
  valid: boolean
  error?: string
} {
  // 파일 타입 검증
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.',
    }
  }

  // 파일 크기 검증 (10MB 제한)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size too large. Maximum size is 10MB.',
    }
  }

  return { valid: true }
}

/**
 * 사설 버킷의 객체를 일시적으로 조회하기 위한 서명 URL 생성
 */
export async function getSignedUrlForKey(
  key: string,
  expiresInSeconds: number = 60 * 60
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })
  return await getSignedUrl(r2Client, command, { expiresIn: expiresInSeconds })
}
