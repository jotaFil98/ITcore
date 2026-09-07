import React, { useState } from 'react'
import { Users, MonitorPlay, Layers } from 'lucide-react'
import ClientView from './components/ClientView'
import TechDashboard from './components/TechDashboard'

export default function App() {
  const [currentView, setCurrentView] = useState('client') // 'client' o 'tech'

  return (
    <div className="min-h-screen bg-[#0c0a14] text-gray-100 flex flex-col justify-between selection:bg-purple-500 selection:text-white">
      {/* Navbar Superior flotante para alternar vistas fácilmente */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#0c0a14]/80 border-b border-[#2a2240] px-4 py-3">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-purple-600 to-indigo-600 p-2 rounded-xl text-white shadow-md shadow-purple-900/50">
              <Layers size={20} />
            </div>
            <span className="font-bold text-base tracking-tight text-white">Soporte<span className="text-purple-400">Tech</span></span>
          </div>

          <div className="bg-[#161325] p-1 rounded-2xl border border-[#2a2240] flex space-x-1">
            <button
              onClick={() => setCurrentView('client')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                currentView === 'client'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/40'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Users size={15} /> Vista Clientes
            </button>
            <button
              onClick={() => setCurrentView('tech')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                currentView === 'tech'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/40'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <MonitorPlay size={15} /> Panel Técnico
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Dinámico según la vista seleccionada */}
      <main className="flex-grow py-6">
        {currentView === 'client' ? <ClientView /> : <TechDashboard />}
      </main>

      {/* Footer minimalista */}
      <footer className="text-center py-6 text-xs text-gray-600 border-t border-[#2a2240]/40">
        Sistema de Soporte Técnico Integrado con Supabase & Vercel
      </footer>
    </div>
  )
}