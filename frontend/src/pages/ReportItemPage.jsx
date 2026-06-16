import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Upload, X, Image } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import api from '../lib/api.js'

const CATEGORIES = ['electronics', 'clothing', 'documents', 'pets', 'jewellery', 'bags', 'keys', 'other']

export default function ReportItemPage() {
  const navigate = useNavigate()
  const [imagePreview, setImagePreview] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [itemType, setItemType] = useState('lost')

  const { register, handleSubmit, formState: { errors } } = useForm()

  const { mutate, isPending, error } = useMutation({
    mutationFn: async (data) => {
      const formData = new FormData()
      Object.entries(data).forEach(([k, v]) => formData.append(k, v))
      formData.append('type', itemType)
      formData.append('image', imageFile)
      return api.post('/api/items', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    },
    onSuccess: (res) => navigate(`/items/${res.data.id}`),
  })

  const handleImage = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Report an item</h1>
      <p className="text-gray-500 mb-8">Fill in the details and upload a clear photo. The AI will start looking for matches automatically.</p>

      {/* Type toggle */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {['lost', 'found'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setItemType(t)}
            className={`py-3 rounded-xl font-semibold text-sm transition-all border-2 ${
              itemType === t
                ? t === 'lost'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
          >
            {t === 'lost' ? '😟 I lost something' : '🙌 I found something'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(mutate)} className="space-y-5">
        {/* Image upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Photo *</label>
          {imagePreview ? (
            <div className="relative rounded-xl overflow-hidden aspect-video bg-gray-100">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => { setImagePreview(null); setImageFile(null) }}
                className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow hover:bg-gray-50"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
              <Image size={32} className="text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Click to upload a photo</span>
              <span className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP up to 10MB</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
            </label>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Item title *</label>
          <input
            {...register('title', { required: 'Title is required', minLength: { value: 3, message: 'At least 3 characters' } })}
            placeholder="e.g. Blue iPhone 14 with cracked case"
            className="input"
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea
            {...register('description', { required: 'Description is required', minLength: { value: 10, message: 'At least 10 characters' } })}
            rows={3}
            placeholder="Describe the item in detail — colour, brand, any unique marks..."
            className="input resize-none"
          />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
        </div>

        {/* Category + Location */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select {...register('category', { required: true })} className="input capitalize">
              <option value="">Select...</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="capitalize">{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
            <input
              {...register('location', { required: 'Location is required' })}
              placeholder="e.g. Patna railway station"
              className="input"
            />
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date {itemType === 'lost' ? 'lost' : 'found'} *
          </label>
          <input
            {...register('dateOccurred', { required: 'Date is required' })}
            type="date"
            max={new Date().toISOString().split('T')[0]}
            className="input"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg px-4 py-3">
            {error.response?.data?.error || 'Something went wrong. Please try again.'}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || !imageFile}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3"
        >
          {isPending ? (
            <><span className="animate-spin">⟳</span> Uploading & matching...</>
          ) : (
            <><Upload size={16} /> Submit & start AI matching</>
          )}
        </button>
      </form>
    </div>
  )
}
