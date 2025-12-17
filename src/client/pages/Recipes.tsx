import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Plus, Search } from 'lucide-react'
import RecipeCard, { Recipe } from '../components/RecipeCard'

const Recipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/recipes', { credentials: 'include' })
        const data = await res.json()
        setRecipes(data.recipes ?? [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    return recipes.filter((r) => r.title.toLowerCase().includes(search.toLowerCase()))
  }, [recipes, search])

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink dark:text-white">Recipes</h1>
          <p className="text-sm text-muted mt-1">
            {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'} in your collection
          </p>
        </div>
        <Link to="/add" className="btn-primary hidden sm:inline-flex">
          <Plus size={18} />
          New Recipe
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search recipes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="!pl-11"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card overflow-hidden">
              <div className="h-48 skeleton" />
              <div className="p-4 space-y-3">
                <div className="h-5 w-3/4 skeleton" />
                <div className="h-4 w-full skeleton" />
                <div className="h-4 w-2/3 skeleton" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <BookOpen className="empty-state-icon" />
          <h3 className="text-lg font-semibold text-ink dark:text-white mb-1">
            {search ? 'No recipes found' : 'No recipes yet'}
          </h3>
          <p className="text-muted mb-4">
            {search ? 'Try a different search term' : 'Add your first recipe to get started'}
          </p>
          {!search && (
            <Link to="/add" className="btn-primary">
              <Plus size={18} />
              Add Recipe
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Recipes
