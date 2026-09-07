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
    // Contraseña actualizada a gorditolindo
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
    <div className="min-h-screen bg-[#0c0a14] text-gray-100 flex flex-col justify-between selection:bg-purple-500 selection:text-white">
      {/* Modal de Autenticación Elegante */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#161325] border border-[#2a2240] rounded-3xl p-6 md:p-8 w-full max-w-sm shadow-2xl relative">
            <button 
              onClick={() => { setShowLoginModal(false); setLoginError(false); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white bg-[#221c38] p-2 rounded-full transition"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-purple-600/20 border border-purple-500/30 text-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                <Lock size={24} />
              </div>
              <h2 className="text-xl font-bold text-white">Panel Técnico</h2>
              <p className="text-gray-400 text-xs mt-1">Introduce tus credenciales de acceso</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Usuario</label>
                <div className="relative">
                  <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    className="w-full bg-[#0c0a14] border border-[#2a2240] rounded-2xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-purple-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Contraseña</label>
                <div className="relative">
                  <Key size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#0c0a14] border border-[#2a2240] rounded-2xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-purple-500 transition"
                  />
                </div>
              </div>

              {loginError && (
                <p className="text-red-400 text-xs text-center font-medium bg-red-950/40 py-2 rounded-xl border border-red-900/40">
                  Credenciales incorrectas. Intenta de nuevo.
                </p>
              )}

              <button
                type="submit"
                className="w-full mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-3.5 rounded-2xl shadow-lg shadow-purple-900/40 transition transform active:scale-95"
              >
                Acceder al Sistema
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Navbar Superior */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#0c0a14]/80 border-b border-[#2a2240] px-4 py-3">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-purple-600 to-indigo-600 p-2 rounded-xl text-white shadow-md shadow-purple-900/50">
              <Layers size={20} />
            </div>
            <span className="font-bold text-base tracking-tight text-white">Soporte<span className="text-purple-400">Tech</span></span>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-[#161325] p-1 rounded-2xl border border-[#2a2240] flex space-x-1">
              <button
                onClick={() => handleNavClick('client')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                  currentView === 'client'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/40'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Users size={15} /> Vista Clientes
              </button>
              <button
                onClick={() => handleNavClick('tech')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                  currentView === 'tech'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/40'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <MonitorPlay size={15} /> Panel Técnico {isAuth && '✓'}
              </button>
            </div>

            {isAuth && currentView === 'tech' && (
              <button
                onClick={handleLogout}
                title="Cerrar sesión"
                className="bg-[#161325] hover:bg-red-950/40 text-gray-400 hover:text-red-400 p-2.5 rounded-2xl border border-[#2a2240] transition"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="flex-grow py-6">
        {currentView === 'client' ? <ClientView /> : <TechDashboard />}
      </main>

      <footer className="text-center py-6 text-xs text-gray-600 border-t border-[#2a2240]/40">
        Sistema de Soporte Técnico Integrado con Supabase & Vercel
      </footer>
    </div>
  )
}