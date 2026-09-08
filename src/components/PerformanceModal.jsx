import React from 'react'
import { X, TrendingUp, Clock, Star, Building2, Award } from 'lucide-react'

export default function PerformanceModal({ tickets, onClose }) {
  // Calcular métricas avanzadas
  const totalTickets = tickets.length
  const completedTickets = tickets.filter(t => t.status === 'Ticket atendido')
  const completionRate = totalTickets > 0 ? Math.round((completedTickets.length / totalTickets) * 100) : 0

  // Agrupar valoraciones por empresa
  const companyStats = {}
  tickets.forEach(t => {
    if (t.company) {
      if (!companyStats[t.company]) {
        companyStats[t.company] = { total: 0, sumRating: 0, countRated: 0 }
      }
      companyStats[t.company].total += 1
      if (t.rating) {
        companyStats[t.company].sumRating += t.rating
        companyStats[t.company].countRated += 1
      }
    }
  })

  const companyList = Object.keys(companyStats).map(comp => {
    const stats = companyStats[comp]
    const avg = stats.countRated > 0 ? (stats.sumRating / stats.countRated).toFixed(1) : 'Sin evaluar'
    return {
      company: comp,
      total: stats.total,
      avgRating: avg
    }
  })

  // Calcular tiempo promedio simulado de resolución (basado en created_at y resolved_at)
  let totalMinutes = 0
  let resolvedCount = 0
  completedTickets.forEach(t => {
    if (t.created_at && t.resolved_at) {
      const diff = new Date(t.resolved_at) - new Date(t.created_at)
      const minutes = diff / (1000 * 60)
      if (minutes > 0) {
        totalMinutes += minutes
        resolvedCount++
      }
    }
  })
  const avgTimeMinutes = resolvedCount > 0 ? Math.round(totalMinutes / resolvedCount) : 15 // Por defecto 15m si hay pocos datos

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#161325] border border-[#2a2240] rounded-3xl p-6 md:p-8 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white bg-[#221c38] p-2 rounded-full transition"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-600/20 border border-purple-500/30 text-purple-400 rounded-2xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Panel de Rendimiento y Analítica</h2>
            <p className="text-gray-400 text-xs">Métricas de productividad, tiempos y satisfacción por empresa</p>
          </div>
        </div>

        {/* Tarjetas de Estadísticas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#0c0a14] border border-[#2a2240] rounded-2xl p-4">
            <span className="text-xs text-gray-400 font-semibold uppercase">Efectividad</span>
            <div className="text-2xl font-bold text-purple-400 mt-1">{completionRate}%</div>
            <p className="text-[11px] text-gray-500 mt-0.5">{completedTickets.length} de {totalTickets} resueltos</p>
          </div>
          
          <div className="bg-[#0c0a14] border border-[#2a2240] rounded-2xl p-4">
            <span className="text-xs text-gray-400 font-semibold uppercase">Tiempo Promedio</span>
            <div className="text-2xl font-bold text-indigo-400 mt-1">~{avgTimeMinutes} min</div>
            <p className="text-[11px] text-gray-500 mt-0.5">Por resolución de ticket</p>
          </div>

          <div className="bg-[#0c0a14] border border-[#2a2240] rounded-2xl p-4">
            <span className="text-xs text-gray-400 font-semibold uppercase">Empresas Activas</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{Object.keys(companyStats).length}</div>
            <p className="text-[11px] text-gray-500 mt-0.5">Clientes atendidos</p>
          </div>
        </div>

        {/* Valoración por Empresas */}
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
            <Building2 size={16} className="text-purple-400" /> Satisfacción y Estrellas por Empresa
          </h3>

          {companyList.length === 0 ? (
            <p className="text-xs text-gray-500 bg-[#0c0a14] p-4 rounded-2xl text-center border border-[#2a2240]">
              No hay datos de empresas registrados todavía.
            </p>
          ) : (
            <div className="space-y-2.5">
              {companyList.map((item) => (
                <div key={item.company} className="bg-[#0c0a14] border border-[#2a2240] p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <strong className="text-white text-sm block">{item.company}</strong>
                    <span className="text-xs text-gray-400">Total de tickets: {item.total}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#161325] px-3 py-1.5 rounded-xl border border-[#2a2240]">
                    <Star size={15} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-bold text-white">{item.avgRating}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 bg-[#221c38] hover:bg-[#2e264c] text-gray-300 font-medium py-3 rounded-2xl text-xs transition border border-[#3b305c]"
        >
          Cerrar Analítica
        </button>
      </div>
    </div>
  )
}