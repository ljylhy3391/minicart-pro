import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  uploadToR2,
  generateFileName,
  validateImageFile,
  listImagesFromR2,
  deleteFromR2,
} from '@/lib/r2'

// R2 설정이 없을 때 임시 모킹 함수들
import {
  uploadToR2 as mockUploadToR2,
  generateFileName as mockGenerateFileName,
  validateImageFile as mockValidateImageFile,
  listImagesFromR2 as mockListImagesFromR2,
  deleteFromR2 as mockDeleteFromR2,
} from '@/lib/r2-mock'

// POST /api/upload - 이미지 업로드
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('image') as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // R2 설정 확인 (R2_* 또는 CLOUDFLARE_* 모두 지원)
    const hasR2Config =
      (process.env.R2_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID) &&
      (process.env.R2_ACCESS_KEY_ID || process.env.CLOUDFLARE_ACCESS_KEY_ID)

    // 파일 유효성 검사
    const validation = hasR2Config
      ? validateImageFile(file)
      : mockValidateImageFile(file)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // 파일명 생성
    const fileName = hasR2Config
      ? generateFileName(file.name)
      : mockGenerateFileName(file.name)

    // Cloudflare R2에 업로드 (또는 모킹)
    const uploadResult = hasR2Config
      ? await uploadToR2(file, fileName)
      : await mockUploadToR2(file, fileName)

    if (!uploadResult.success) {
      return NextResponse.json(
        { error: uploadResult.error || 'Upload failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      imageUrl: uploadResult.imageUrl,
      // 퍼블릭 URL 접근이 막혀 있을 수 있으므로 즉시 미리보기 가능한 서명 URL도 함께 제공
      previewUrl: uploadResult.fileName
        ? await (async () => {
            try {
              const { getSignedUrlForKey } = await import('@/lib/r2')
              return await getSignedUrlForKey(uploadResult.fileName)
            } catch {
              return undefined
            }
          })()
        : undefined,
      fileName: uploadResult.fileName,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

// GET /api/upload - 업로드된 이미지 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const folder = searchParams.get('folder') || 'products'

    // R2 설정 확인 (R2_* 또는 CLOUDFLARE_* 모두 지원)
    const hasR2Config =
      (process.env.R2_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID) &&
      (process.env.R2_ACCESS_KEY_ID || process.env.CLOUDFLARE_ACCESS_KEY_ID)

    // Cloudflare R2에서 이미지 목록 조회 (또는 모킹)
    const images = hasR2Config
      ? await listImagesFromR2(folder)
      : await mockListImagesFromR2(folder)

    return NextResponse.json({
      images,
    })
  } catch (error) {
    console.error('Error fetching images:', error)
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    )
  }
}

// DELETE /api/upload - 이미지 삭제
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fileName = searchParams.get('fileName')

    if (!fileName) {
      return NextResponse.json(
        { error: 'File name is required' },
        { status: 400 }
      )
    }

    // R2 설정 확인 (R2_* 또는 CLOUDFLARE_* 모두 지원)
    const hasR2Config =
      (process.env.R2_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID) &&
      (process.env.R2_ACCESS_KEY_ID || process.env.CLOUDFLARE_ACCESS_KEY_ID)

    // Cloudflare R2에서 이미지 삭제 (또는 모킹)
    const success = hasR2Config
      ? await deleteFromR2(fileName)
      : await mockDeleteFromR2(fileName)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete image' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting image:', error)
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    )
  }
}
