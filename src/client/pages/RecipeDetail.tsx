import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Clock, Edit2, ImageOff, Trash2, User } from 'lucide-react'
import DOMPurify from 'dompurify'

type RecipeDetailData = {
  id: number
  title: string
  content: string
  image_path?: string | null
  author?: string | null
  created_at?: string
  updated_at?: string
}

const RecipeDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [recipe, setRecipe] = useState<RecipeDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const res = await fetch(`/api/recipes/${id}`, { credentials: 'include' })
      if (res.status === 404) {
        navigate('/recipes', { replace: true })
        return
      }
      const data = await res.json()
      setRecipe(data.recipe)
      setLoading(false)
    }
    load()
  }, [id, navigate])

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this recipe?')) return
    setDeleting(true)
    try {
      await fetch(`/api/recipes/${id}`, { method: 'DELETE', credentials: 'include' })
      navigate('/recipes', { replace: true })
    } catch {
      setDeleting(false)
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    })
  }

  // Check if content is HTML (has HTML tags) or plain text
  const isHTML = (text: string) => {
    const htmlTagRegex = /<\/?[a-z][\s\S]*>/i
    return htmlTagRegex.test(text)
  }

  // Render content - HTML if it contains tags, otherwise plain text
  const renderContent = (content: string) => {
    if (isHTML(content)) {
      // Sanitize and render HTML
      const sanitized = DOMPurify.sanitize(content, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'a'],
        ALLOWED_ATTR: ['href', 'target', 'rel'],
      })
      return <div className="prose prose-gray dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: sanitized }} />
    } else {
      // Render as plain text (backward compatibility)
      return (
        <p className="whitespace-pre-wrap text-ink/80 dark:text-gray-300 leading-relaxed">
          {content}
        </p>
      )
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="card overflow-hidden">
          <div className="h-72 skeleton" />
          <div className="p-6 space-y-4">
            <div className="h-8 w-1/2 skeleton" />
            <div className="h-4 w-1/4 skeleton" />
            <div className="space-y-2">
              <div className="h-4 w-full skeleton" />
              <div className="h-4 w-full skeleton" />
              <div className="h-4 w-3/4 skeleton" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!recipe) return null

  return (
    <div className="page-container space-y-4">
      {/* Header actions */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => navigate('/recipes')}
          className="flex items-center gap-2 text-sm font-medium text-muted hover:text-ink dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
          Back to recipes
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/recipes/${recipe.id}/edit`)}
            className="btn-secondary"
          >
            <Edit2 size={16} />
            <span className="hidden sm:inline">Edit</span>
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="btn-danger"
          >
            <Trash2 size={16} />
            <span className="hidden sm:inline">{deleting ? 'Deleting...' : 'Delete'}</span>
          </button>
        </div>
      </div>

      {/* Recipe card */}
      <article className="card overflow-hidden">
        {recipe.image_path ? (
          <img
            src={recipe.image_path}
            alt={recipe.title}
            className="w-full h-72 object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-72 image-placeholder">
            <ImageOff size={48} />
          </div>
        )}
        <div className="p-6 sm:p-8 space-y-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-ink dark:text-white">
            {recipe.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
            {recipe.author && (
              <span className="flex items-center gap-1.5">
                <User size={14} />
                {recipe.author}
              </span>
            )}
            {recipe.created_at && (
              <span className="flex items-center gap-1.5">
                <Clock size={14} />
                {formatDate(recipe.created_at)}
              </span>
            )}
          </div>

          <hr className="border-gray-100 dark:border-gray-800" />

          <div>
            {renderContent(recipe.content)}
          </div>
        </div>
      </article>
    </div>
  )
}

export default RecipeDetail
