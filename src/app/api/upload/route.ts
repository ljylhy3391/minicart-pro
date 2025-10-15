import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

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

    // 파일 타입 검증
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.',
        },
        { status: 400 }
      )
    }

    // 파일 크기 검증 (10MB 제한)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // TODO: 실제 구현 시 Cloudflare R2 또는 Supabase Storage 사용
    // 현재는 임시로 파일 정보만 반환
    const fileName = `${Date.now()}-${file.name}`

    // 실제 구현 예시:
    // const imageUrl = await uploadToCloudflareR2(file, fileName)
    // 또는
    // const imageUrl = await uploadToSupabaseStorage(file, fileName)

    // 임시 URL 반환 (실제 구현 시 위의 코드 사용)
    const imageUrl = `/uploads/${fileName}`

    return NextResponse.json({
      success: true,
      imageUrl,
      fileName,
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

    // TODO: 실제 구현 시 저장소에서 사용자의 이미지 목록 조회
    // 현재는 빈 배열 반환
    return NextResponse.json({
      images: [],
    })
  } catch (error) {
    console.error('Error fetching images:', error)
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    )
  }
}
