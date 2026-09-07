import React, { useState, useEffect } from 'react'
import { Calendar, CheckCircle, Clock, AlertCircle, Building2, User, ChevronRight, Star, RefreshCw } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function TechDashboard() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  // Cargar tickets de Supabase en tiempo real o por llamada
  const fetchTickets = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error al cargar tickets:', error)
    } else {
      setTickets(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  // Cambiar estado fluidamente
  const handleStatusChange = async (ticketId, currentStatus) => {
    let nextStatus = ''
    let resolvedAtValue = null

    if (currentStatus === 'Ticket entregado') {
      nextStatus = 'Atendiendo el ticket'
    } else if (currentStatus === 'Atendiendo el ticket') {
      nextStatus = 'Ticket atendido'
      resolvedAtValue = new Date().toISOString()
    } else {
      nextStatus = 'Ticket entregado' // Ciclo opcional o reinicio
    }

    const updatePayload = { status: nextStatus }
    if (resolvedAtValue) {
      updatePayload.resolved_at = resolvedAtValue
    }

    const { error } = await supabase
      .from('tickets')
      .update(updatePayload)
      .eq('id', ticketId)

    if (error) {
      console.error('Error al actualizar estado:', error)
      alert('No se pudo actualizar el estado.')
    } else {
      fetchTickets()
    }
  }

  // Métricas calculadas para la parte superior estilo "Let's improve our performance"
  const totalCount = tickets.length
  const completedCount = tickets.filter(t => t.status === 'Ticket atendido').length
  const performancePercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'Necesario':
        return <span className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">🟡 Necesario</span>
      case 'Prioritario':
        return <span className="bg-orange-500/20 text-orange-300 border border-orange-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">🟠 Prioritario</span>
      case 'Urgente':
        return <span className="bg-red-500/20 text-red-300 border border-red-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">🔴 Urgente</span>
      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 pb-20 animate-fadeIn">
      {/* Header y Panel de Rendimiento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-2 bg-[#161325] border border-[#2a2240] rounded-3xl p-6 relative overflow-hidden shadow-xl">
          <div className="absolute right-[-20px] bottom-[-20px] w-40 h-40 bg-purple-600/10 rounded-full blur-3xl"></div>
          <h1 className="text-2xl font-bold text-white">Panel de Técnicos</h1>
          <p className="text-xs text-gray-400 mt-1">Monitorea y gestiona el flujo de servicios técnicos en tiempo real.</p>
          
          <div className="mt-4 flex items-center gap-3">
            <button 
              onClick={fetchTickets}
              className="bg-[#221c38] hover:bg-[#2e264c] text-gray-300 text-xs px-3.5 py-2 rounded-xl flex items-center gap-2 border border-[#3b305c] transition"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Actualizar lista
            </button>
          </div>
        </div>

        {/* Tarjeta de Rendimiento (Circular simulado estilo UI de referencia) */}
        <div className="bg-[#161325] border border-[#2a2240] rounded-3xl p-6 flex items-center justify-between shadow-xl">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase">Rendimiento</p>
            <h3 className="text-xl font-bold text-white mt-1">Tareas al día</h3>
            <span className="text-xs text-purple-400 font-medium mt-1 inline-block">{completedCount} de {totalCount} completados</span>
          </div>
          <div className="relative w-16 h-16 flex items-center justify-center rounded-full bg-[#0c0a14] border-4 border-purple-600/30">
            <span className="text-sm font-bold text-purple-300">{performancePercentage}%</span>
          </div>
        </div>
      </div>

      {/* Listado de Tickets en Tarjetas */}
      <div className="bg-[#161325] border border-[#2a2240] rounded-3xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar size={18} className="text-purple-400" /> Tickets Recibidos
          </h2>
          <span className="text-xs bg-[#221c38] text-gray-300 px-3 py-1 rounded-full border border-[#362b52]">
            {tickets.length} Total
          </span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500 text-sm">Cargando tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm bg-[#0c0a14]/40 rounded-2xl border border-dashed border-[#2a2240]">
            No hay tickets registrados todavía.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tickets.map((ticket) => (
              <div 
                key={ticket.id} 
                className="bg-[#0c0a14] border border-[#2a2240] hover:border-purple-500/40 rounded-2xl p-5 transition flex flex-col justify-between shadow-md relative group"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold text-purple-400 bg-purple-950/60 px-2.5 py-1 rounded-md border border-purple-800/30">
                      {ticket.ticket_type}
                    </span>
                    {getPriorityBadge(ticket.priority)}
                  </div>

                  <h3 className="text-base font-bold text-white mb-2">{ticket.client_name}</h3>
                  
                  <div className="space-y-1 text-xs text-gray-400 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Building2 size={13} className="text-purple-400" /> {ticket.company}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} className="text-purple-400" /> 
                      {new Date(ticket.created_at).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                  </div>

                  {/* Valoración del cliente si existe */}
                  {ticket.rating && (
                    <div className="bg-[#161325] p-2.5 rounded-xl border border-[#2a2240] mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[...Array(ticket.rating)].map((_, i) => (
                          <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      {ticket.feedback_comment && (
                        <span className="text-[11px] text-gray-300 italic truncate max-w-[150px]">
                          "{ticket.feedback_comment}"
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Acciones de Estado (Botón para avanzar flujo) */}
                <div className="pt-3 border-t border-[#2a2240] flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className={`w-2 h-2 rounded-full ${
                      ticket.status === 'Ticket atendido' ? 'bg-green-500' :
                      ticket.status === 'Atendiendo el ticket' ? 'bg-orange-500' : 'bg-yellow-500'
                    }`}></span>
                    <span className="font-semibold text-gray-300">{ticket.status}</span>
                  </div>

                  <button
                    onClick={() => handleStatusChange(ticket.id, ticket.status)}
                    className="bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-purple-700/40 transition flex items-center gap-1"
                  >
                    Avanzar <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}