import React, { useState } from 'react'
import { Users, MonitorPlay, Layers, Lock, User, Key, X, LogOut } from 'lucide-react'
import ClientView from './components/ClientView'
import TechDashboard from './components/TechDashboard'

export default function App() {
  const [currentView, setCurrentView] = useState('client')
  const [isAuth, setIsAuth] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState(false)

  const handleNavClick = (view) => {
    if (view === 'tech' && !isAuth) {
      setShowLoginModal(true)
    } else {
      setCurrentView(view)
    }
  }

  const handleLogin = (e) => {
    e.preventDefault()
    if (username === 'admin' && password === 'gorditolindo') {
      setIsAuth(true)
      setShowLoginModal(false)
      setCurrentView('tech')
      setUsername('')
      setPassword('')
      setLoginError(false)
    } else {
      setLoginError(true)
    }
  }

  const handleLogout = () => {
    setIsAuth(false)
    setCurrentView('client')
  }

  return (
    <div className="min-h-screen text-gray-800 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Modal de Autenticación */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-sm shadow-2xl relative border border-gray-100">
            <button 
              onClick={() => { setShowLoginModal(false); setLoginError(false); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full transition"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                <Lock size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Panel Técnico</h2>
              <p className="text-gray-500 text-xs mt-1">Introduce tus credenciales de acceso</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Usuario</label>
                <div className="relative">
                  <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-11 pr-4 text-gray-900 text-sm focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Contraseña</label>
                <div className="relative">
                  <Key size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-11 pr-4 text-gray-900 text-sm focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              {loginError && (
                <p className="text-red-500 text-xs text-center font-medium bg-red-50 py-2 rounded-xl border border-red-100">
                  Credenciales incorrectas. Intenta de nuevo.
                </p>
              )}

              <button
                type="submit"
                className="w-full mt-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-emerald-500/30 transition transform active:scale-95"
              >
                Acceder al Sistema
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Navbar Superior */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 p-2 rounded-xl text-white shadow-md shadow-emerald-600/30">
              <Layers size={20} />
            </div>
            <span className="font-extrabold text-base tracking-tight text-gray-900">Soporte<span className="text-emerald-600">Tech</span></span>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-gray-100 p-1 rounded-2xl border border-gray-200 flex space-x-1">
              <button
                onClick={() => handleNavClick('client')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  currentView === 'client'
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Users size={15} /> Vista Clientes
              </button>
              <button
                onClick={() => handleNavClick('tech')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  currentView === 'tech'
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <MonitorPlay size={15} /> Panel Técnico {isAuth && '✓'}
              </button>
            </div>

            {isAuth && currentView === 'tech' && (
              <button
                onClick={handleLogout}
                title="Cerrar sesión"
                className="bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-600 p-2.5 rounded-2xl border border-gray-200 transition"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-grow py-6">
        {currentView === 'client' ? <ClientView /> : <TechDashboard />}
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-gray-400 border-t border-gray-200">
        Sistema de Soporte Técnico Integrado con Supabase & Vercel
      </footer>
    </div>
  )
}