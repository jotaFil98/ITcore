import React from 'react'
import { X, TrendingUp, Clock, Star, Building2, Award } from 'lucide-react'

export default function PerformanceModal({ tickets, onClose }) {
  const totalTickets = tickets.length
  const completedTickets = tickets.filter(t => t.status === 'Ticket atendido')
  const completionRate = totalTickets > 0 ? Math.round((completedTickets.length / totalTickets) * 100) : 0

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
  const avgTimeMinutes = resolvedCount > 0 ? Math.round(totalMinutes / resolvedCount) : 15

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto border border-gray-100">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full transition"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
            <TrendingUp size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Panel de Rendimiento y Analítica</h2>
            <p className="text-gray-500 text-xs">Métricas de productividad y satisfacción por empresa</p>
          </div>
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4">
            <span className="text-xs text-gray-500 font-bold uppercase">Efectividad</span>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">{completionRate}%</div>
            <p className="text-[11px] text-gray-400 mt-0.5">{completedTickets.length} de {totalTickets} resueltos</p>
          </div>
          
          <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4">
            <span className="text-xs text-gray-500 font-bold uppercase">Tiempo Promedio</span>
            <div className="text-2xl font-extrabold text-indigo-600 mt-1">~{avgTimeMinutes} min</div>
            <p className="text-[11px] text-gray-400 mt-0.5">Por resolución</p>
          </div>

          <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4">
            <span className="text-xs text-gray-500 font-bold uppercase">Empresas Activas</span>
            <div className="text-2xl font-extrabold text-emerald-700 mt-1">{Object.keys(companyStats).length}</div>
            <p className="text-[11px] text-gray-400 mt-0.5">Clientes atendidos</p>
          </div>
        </div>

        {/* Valoración por empresas */}
        <div>
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Building2 size={16} className="text-emerald-600" /> Satisfacción por Empresa
          </h3>

          {companyList.length === 0 ? (
            <p className="text-xs text-gray-400 bg-gray-50 p-4 rounded-2xl text-center border border-gray-200">
              No hay datos de empresas registrados todavía.
            </p>
          ) : (
            <div className="space-y-2.5">
              {companyList.map((item) => (
                <div key={item.company} className="bg-gray-50 border border-gray-200/80 p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <strong className="text-gray-900 text-sm block">{item.company}</strong>
                    <span className="text-xs text-gray-500">Total tickets: {item.total}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm">
                    <Star size={15} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-extrabold text-gray-900">{item.avgRating}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-2xl text-xs transition"
        >
          Cerrar Analítica
        </button>
      </div>
    </div>
  )
}