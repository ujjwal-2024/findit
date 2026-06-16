export const CATEGORIES = [
  { value: 'ELECTRONICS', label: 'Electronics' },
  { value: 'CLOTHING', label: 'Clothing' },
  { value: 'DOCUMENTS', label: 'Documents' },
  { value: 'PETS', label: 'Pets' },
  { value: 'JEWELLERY', label: 'Jewellery' },
  { value: 'BAGS', label: 'Bags' },
  { value: 'KEYS', label: 'Keys' },
  { value: 'OTHER', label: 'Other' },
]

export const STATUS_COLORS = {
  ACTIVE: 'bg-green-100 text-green-700',
  MATCHED: 'bg-blue-100 text-blue-700',
  RETURNED: 'bg-purple-100 text-purple-700',
  CLOSED: 'bg-gray-100 text-gray-600',
}

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export const scoreColor = (score) => {
  if (score >= 85) return 'text-green-600'
  if (score >= 70) return 'text-amber-600'
  return 'text-red-500'
}
