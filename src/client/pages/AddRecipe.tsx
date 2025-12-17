import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ImagePlus, Save, X } from 'lucide-react'

const AddRecipe = () => {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSelectImage = (file: File | null) => {
    setImage(file)
    if (file) {
      const url = URL.createObjectURL(file)
      setPreview(url)
    } else {
      setPreview(null)
    }
  }

  const removeImage = () => {
    setImage(null)
    setPreview(null)
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('content', content)
      if (image) formData.append('image', image)

      const res = await fetch('/api/recipes', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message || 'Could not create recipe')
      }

      navigate('/recipes')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/recipes')}
          className="btn-ghost"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-ink dark:text-white">New Recipe</h1>
          <p className="text-sm text-muted">Add a new recipe to your collection</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="card p-6 space-y-5">
        {/* Title */}
        <div>
          <label className="label">Recipe Title</label>
          <input
            type="text"
            placeholder="Enter recipe name..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Content */}
        <div>
          <label className="label">Instructions</label>
          <textarea
            placeholder="Write your recipe instructions, ingredients, tips..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            required
          />
        </div>

        {/* Image */}
        <div>
          <label className="label">Photo (optional)</label>
          {preview ? (
            <div className="relative rounded-xl overflow-hidden">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-48 object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:border-accent/50 transition-colors">
              <ImagePlus size={32} className="text-muted mb-2" />
              <span className="text-sm text-muted">Click to upload an image</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onSelectImage(e.target.files?.[0] ?? null)}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button type="submit" className="btn-primary" disabled={loading}>
            <Save size={18} />
            {loading ? 'Saving...' : 'Save Recipe'}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/recipes')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddRecipe
