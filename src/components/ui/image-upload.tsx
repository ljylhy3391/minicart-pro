'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'

interface ImageUploadProps {
  onImageUploaded?: (imageUrl: string, fileName: string) => void
  onImageDeleted?: (fileName: string) => void
  folder?: string
  multiple?: boolean
  maxFiles?: number
  className?: string
}

interface UploadedImage {
  fileName: string
  imageUrl: string
  previewUrl?: string
  size: number
  lastModified: Date
}

export function ImageUpload({
  onImageUploaded,
  onImageDeleted,
  folder = 'products',
  multiple = false,
  maxFiles = 5,
  className = '',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)
    const validFiles = fileArray.filter((file) => {
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
      ]
      const maxSize = 10 * 1024 * 1024 // 10MB
      return allowedTypes.includes(file.type) && file.size <= maxSize
    })

    if (validFiles.length === 0) {
      alert(
        '유효한 이미지 파일을 선택해주세요. (JPEG, PNG, WebP, GIF, 최대 10MB)'
      )
      return
    }

    if (!multiple && validFiles.length > 1) {
      alert('하나의 파일만 선택할 수 있습니다.')
      return
    }

    if (validFiles.length > maxFiles) {
      alert(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`)
      return
    }

    setUploading(true)

    try {
      for (const file of validFiles) {
        const formData = new FormData()
        formData.append('image', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Upload failed')
        }

        const result = await response.json()

        if (result.success) {
          const newImage: UploadedImage = {
            fileName: result.fileName,
            imageUrl: result.imageUrl,
            previewUrl: result.previewUrl,
            size: result.size,
            lastModified: new Date(),
          }

          setUploadedImages((prev) => {
            if (multiple) {
              return [...prev, newImage]
            } else {
              return [newImage]
            }
          })

          onImageUploaded?.(result.imageUrl, result.fileName)
        }
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert(
        `업로드 실패: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (fileName: string) => {
    try {
      const response = await fetch(
        `/api/upload?fileName=${encodeURIComponent(fileName)}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Delete failed')
      }

      setUploadedImages((prev) =>
        prev.filter((img) => img.fileName !== fileName)
      )
      onImageDeleted?.(fileName)
    } catch (error) {
      console.error('Delete error:', error)
      alert(
        `삭제 실패: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 업로드 영역 */}
      <Card
        className={`border-2 border-dashed transition-colors ${
          dragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
            ) : (
              <Upload className="h-6 w-6 text-gray-600" />
            )}
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            {uploading ? '업로드 중...' : '이미지 업로드'}
          </h3>
          <p className="mb-4 text-sm text-gray-500">
            파일을 드래그하거나 클릭하여 업로드하세요
          </p>
          <p className="mb-4 text-xs text-gray-400">
            지원 형식: JPEG, PNG, WebP, GIF (최대 10MB)
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            파일 선택
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
        </div>
      </Card>

      {/* 업로드된 이미지 목록 */}
      {uploadedImages.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">업로드된 이미지</h4>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {uploadedImages.map((image) => (
              <Card key={image.fileName} className="relative overflow-hidden">
                <div className="aspect-square">
                  <img
                    src={image.previewUrl || image.imageUrl}
                    alt="Uploaded"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="bg-opacity-0 hover:bg-opacity-50 absolute inset-0 bg-black transition-all">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 transition-opacity hover:opacity-100"
                    onClick={() => handleDelete(image.fileName)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="p-2">
                  <p className="truncate text-xs text-gray-600">
                    {image.fileName.split('/').pop()}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatFileSize(image.size)}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
