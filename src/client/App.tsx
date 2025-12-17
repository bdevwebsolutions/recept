import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import AddRecipe from './pages/AddRecipe'
import EditRecipe from './pages/EditRecipe'
import FirstSetup from './pages/FirstSetup'
import Login from './pages/Login'
import RecipeDetail from './pages/RecipeDetail'
import Recipes from './pages/Recipes'
import UserManagement from './pages/UserManagement'

const Shell = () => (
  <>
    <Navbar />
    <Outlet />
  </>
)

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/setup"
            element={
              <ProtectedRoute allowSetup>
                <FirstSetup />
              </ProtectedRoute>
            }
          />
          <Route
            element={
              <ProtectedRoute>
                <Shell />
              </ProtectedRoute>
            }
          >
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/recipes/:id" element={<RecipeDetail />} />
            <Route path="/recipes/:id/edit" element={<EditRecipe />} />
            <Route path="/add" element={<AddRecipe />} />
            <Route
              path="/users"
              element={
                <ProtectedRoute requireAdmin>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/recipes" replace />} />
            <Route path="*" element={<Navigate to="/recipes" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

