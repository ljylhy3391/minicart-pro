'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ImageUpload } from '@/components/ui/image-upload'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: {
    id: string
    name: string
  }
  images: Array<{
    id: string
    url: string
    alt: string
  }>
  variants: Array<{
    id: string
    name: string
    value: string
    priceModifier: number
  }>
  createdAt: string
}

interface Category {
  id: string
  name: string
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // 폼 상태
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
  })
  const [productImages, setProductImages] = useState<
    Array<{ url: string; alt: string }>
  >([])

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleImageUploaded = (imageUrl: string, fileName: string) => {
    const newImage = {
      url: imageUrl,
      alt: fileName.split('/').pop() || 'Product image',
    }
    setProductImages((prev) => [...prev, newImage])
  }

  const handleImageDeleted = (fileName: string) => {
    setProductImages((prev) =>
      prev.filter((img) => !img.url.includes(fileName))
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !formData.name ||
      !formData.description ||
      !formData.price ||
      !formData.categoryId
    ) {
      alert('모든 필드를 입력해주세요.')
      return
    }

    // 가격을 숫자로 변환
    const price = Number(formData.price)
    if (isNaN(price) || price <= 0) {
      alert('올바른 가격을 입력해주세요.')
      return
    }

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: price,
          images: productImages,
          variants: [
            {
              name: '기본',
              attributes: { size: '기본', color: '기본' },
            },
          ],
        }),
      })

      if (response.ok) {
        alert('상품이 성공적으로 생성되었습니다.')
        setFormData({ name: '', description: '', price: '', categoryId: '' })
        setProductImages([])
        setShowCreateForm(false)
        fetchProducts()
      } else {
        const error = await response.json()
        alert(`상품 생성 실패: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating product:', error)
      alert('상품 생성 중 오류가 발생했습니다.')
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('정말로 이 상품을 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('상품이 성공적으로 삭제되었습니다.')
        fetchProducts()
      } else {
        const error = await response.json()
        alert(`상품 삭제 실패: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('상품 삭제 중 오류가 발생했습니다.')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(price)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center">
          <div className="text-lg">로딩 중...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">상품 관리</h1>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" />새 상품 추가
        </Button>
      </div>

      {/* 상품 생성 폼 */}
      {showCreateForm && (
        <Card className="mb-6 p-6">
          <h2 className="mb-4 text-xl font-semibold">새 상품 추가</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">상품명</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">가격</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="예: 10000"
                  min="0"
                  step="100"
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">카테고리</label>
              <select
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                required
              >
                <option value="">카테고리 선택</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">설명</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                상품 이미지
              </label>
              <ImageUpload
                onImageUploaded={handleImageUploaded}
                onImageDeleted={handleImageDeleted}
                multiple={true}
                maxFiles={5}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit">상품 생성</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false)
                  setFormData({
                    name: '',
                    description: '',
                    price: '',
                    categoryId: '',
                  })
                  setProductImages([])
                }}
              >
                취소
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* 상품 목록 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            {product.images.length > 0 && (
              <div className="aspect-square">
                <img
                  src={product.images[0].url}
                  alt={product.images[0].alt}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <h3 className="mb-2 text-lg font-semibold">{product.name}</h3>
              <p className="mb-2 text-sm text-gray-600">
                {product.description}
              </p>
              <p className="mb-2 text-lg font-bold text-blue-600">
                {formatPrice(product.price)}
              </p>
              <p className="mb-4 text-sm text-gray-500">
                카테고리: {product.category.name}
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(product.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-gray-500">등록된 상품이 없습니다.</p>
        </div>
      )}
    </div>
  )
}
