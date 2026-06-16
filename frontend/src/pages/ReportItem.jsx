import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { Upload, ImageIcon } from 'lucide-react'
import { createItem } from '../api/items'
import Button from '../components/ui/Button'
import { CATEGORIES } from '../utils/helpers'

export default function ReportItem() {
  const { type } = useParams()
  const navigate = useNavigate()
  const [preview, setPreview] = useState(null)
  const { register, handleSubmit, setValue, formState: { errors } } = useForm()

  const mutation = useMutation({
    mutationFn: createItem,
    onSuccess: (data) => navigate(`/items/${data.id}`),
  })

  const onSubmit = (data) => {
    const fd = new FormData()
    fd.append('type', type.toUpperCase())
    fd.append('title', data.title)
    fd.append('description', data.description)
    fd.append('category', data.category)
    fd.append('location', data.location)
    fd.append('dateOccurred', data.dateOccurred)
    fd.append('image', data.image[0])
    mutation.mutate(fd)
  }

  const isLost = type === 'lost'

  return (
    <div className="max-w-xl mx-auto px-4 py-6 sm:py-10">
      <div className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-3 ${isLost ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
        {isLost ? 'LOST ITEM' : 'FOUND ITEM'}
      </div>
      <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
        {isLost ? 'Report a Lost Item' : 'Report a Found Item'}
      </h1>
      <p className="text-slate-500 text-sm mb-6 sm:mb-8">
        Upload a clear photo — our AI will automatically match it against {isLost ? 'found' : 'lost'} items.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Image upload */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Photo *</label>
          <label className="block border-2 border-dashed border-slate-300 rounded-xl p-5 sm:p-6 text-center cursor-pointer hover:border-blue-400 transition-colors">
            {preview ? (
              <img src={preview} alt="preview" className="max-h-44 sm:max-h-48 mx-auto rounded-lg object-cover" />
            ) : (
              <div className="text-slate-400">
                <ImageIcon className="h-9 w-9 sm:h-10 sm:w-10 mx-auto mb-2" />
                <p className="text-sm">Tap to upload a photo</p>
                <p className="text-xs mt-1">JPG, PNG, WEBP up to 10MB</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                if (e.target.files[0]) {
                  setPreview(URL.createObjectURL(e.target.files[0]))
                  setValue('image', e.target.files, { shouldValidate: true })
                }
              }}
            />
          </label>
          {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
          <input
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Blue iPhone 14 with cracked screen"
            {...register('title', { required: 'Title is required', minLength: { value: 3, message: 'Too short' } })}
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
          <textarea
            rows={3}
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe the item in detail — colour, brand, size, unique markings..."
            {...register('description', { required: 'Description is required', minLength: { value: 10, message: 'Too short' } })}
          />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
            <select
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('category', { required: 'Category is required' })}
            >
              <option value="">Select...</option>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date {isLost ? 'Lost' : 'Found'} *</label>
            <input
              type="date"
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('dateOccurred', { required: 'Date is required' })}
            />
            {errors.dateOccurred && <p className="text-red-500 text-xs mt-1">{errors.dateOccurred.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Location *</label>
          <input
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Near Central Park Gate 3, New York"
            {...register('location', { required: 'Location is required' })}
          />
          {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
        </div>

        {mutation.isError && (
          <p className="text-red-500 text-sm">
            {mutation.error?.response?.data?.error || 'Something went wrong'}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? 'Uploading & matching...' : (
            <><Upload className="h-4 w-4 mr-2" /> Post {isLost ? 'Lost' : 'Found'} Item</>
          )}
        </Button>
      </form>
    </div>
  )
}
