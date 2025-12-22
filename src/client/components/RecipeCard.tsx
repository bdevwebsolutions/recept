import { Link } from 'react-router-dom'
import { Clock, ImageOff, User } from 'lucide-react'

export type Recipe = {
  id: number
  title: string
  content: string
  image_path?: string | null
  author?: string | null
  created_at?: string
}

const RecipeCard = ({ recipe }: { recipe: Recipe }) => {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <Link to={`/recipes/${recipe.id}`} className="block group">
      <article className="card overflow-hidden">
        {recipe.image_path ? (
          <div className="relative h-48 overflow-hidden">
            <img
              src={recipe.image_path}
              alt={recipe.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ) : (
          <div className="h-48 image-placeholder">
            <ImageOff size={32} />
          </div>
        )}
        <div className="p-4 space-y-2">
          <h3 className="text-lg font-semibold text-ink dark:text-white group-hover:text-accent transition-colors line-clamp-1">
            {recipe.title}
          </h3>
          <div className="flex items-center gap-3 pt-2 text-xs text-muted">
            {recipe.author && (
              <span className="flex items-center gap-1">
                <User size={12} />
                {recipe.author}
              </span>
            )}
            {recipe.created_at && (
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {formatDate(recipe.created_at)}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}

export default RecipeCard
