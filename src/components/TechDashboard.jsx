import React, { useState, useEffect } from 'react'
import { Calendar, CheckCircle, Clock, AlertCircle, Building2, User, ChevronRight, Star, RefreshCw, BarChart3, Bell, Settings, MessageSquare, Mail, X, Trash2 } from 'lucide-react'
import { supabase } from '../supabaseClient'
import PerformanceModal from './PerformanceModal'

export default function TechDashboard() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(null)
  const [showPerformanceModal, setShowPerformanceModal] = useState(false)
  const [newTicketAlert, setNewTicketAlert] = useState(null)

  // Estados de configuración de notificaciones
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [techWhatsapp, setTechWhatsapp] = useState(localStorage.getItem('tech_whatsapp') || '')
  const [techEmail, setTechEmail] = useState(localStorage.getItem('tech_email') || '')
  const [notifPermission, setNotifPermission] = useState(Notification.permission || 'default')

  // Estado para el modal de confirmación de eliminación
  const [ticketToDelete, setTicketToDelete] = useState(null)

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

    const channel = supabase
      .channel('public:tickets')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tickets' }, (payload) => {
        const ticket = payload.new
        setNewTicketAlert(ticket)
        fetchTickets()

        if (Notification.permission === 'granted') {
          new Notification('¡Nuevo Ticket de Soporte!', {
            body: `${ticket.client_name} (${ticket.company}) - Prioridad: ${ticket.priority}`,
            icon: '/vite.svg'
          })
        }

        setTimeout(() => setNewTicketAlert(null), 7000)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const requestBrowserPermission = () => {
    if (!('Notification' in window)) {
      alert('Tu navegador no soporta notificaciones de escritorio.')
      return
    }
    Notification.requestPermission().then((permission) => {
      setNotifPermission(permission)
      if (permission === 'granted') {
        new Notification('¡Notificaciones activadas!', { body: 'Recibirás alertas cuando se creen tickets.' })
      }
    })
  }

  const saveSettings = (e) => {
    e.preventDefault()
    localStorage.setItem('tech_whatsapp', techWhatsapp)
    localStorage.setItem('tech_email', techEmail)
    setShowSettingsModal(false)
    alert('Configuración de alertas guardada con éxito.')
  }

  const handleStatusChange = async (ticketId, currentStatus) => {
    let nextStatus = ''
    let resolvedAtValue = null

    if (currentStatus === 'Ticket entregado') {
      nextStatus = 'Atendiendo el ticket'
    } else if (currentStatus === 'Atendiendo el ticket') {
      nextStatus = 'Ticket atendido'
      resolvedAtValue = new Date().toISOString()
    } else {
      nextStatus = 'Ticket entregado'
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

  // Función para eliminar el ticket de Supabase
  const confirmDeleteTicket = async () => {
    if (!ticketToDelete) return

    const { error } = await supabase
      .from('tickets')
      .delete()
      .eq('id', ticketToDelete.id)

    if (error) {
      console.error('Error al eliminar ticket:', error)
      alert('Hubo un error al eliminar el ticket de la base de datos.')
    } else {
      // Si el cliente tenía este ticket activo en su localStorage, limpiarlo
      if (localStorage.getItem('active_ticket_id') === ticketToDelete.id) {
        localStorage.removeItem('active_ticket_id')
      }
      setTicketToDelete(null)
      fetchTickets()
    }
  }

  const getDaysBar = () => {
    const days = []
    for (let i = 4; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      days.push({
        dateStr: d.toISOString().split('T')[0],
        dayName: d.toLocaleDateString('es-ES', { weekday: 'short' }),
        dayNum: d.getDate()
      })
    }
    return days
  }

  const daysList = getDaysBar()
  const filteredTickets = selectedDate 
    ? tickets.filter(t => t.created_at && t.created_at.startsWith(selectedDate))
    : tickets

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
    <div className="max-w-4xl mx-auto p-4 md:p-6 pb-20 animate-fadeIn relative">
      {showPerformanceModal && (
        <PerformanceModal tickets={tickets} onClose={() => setShowPerformanceModal(false)} />
      )}

      {/* Modal de Confirmación de Eliminación */}
      {ticketToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#161325] border border-[#2a2240] rounded-3xl p-6 md:p-8 w-full max-w-sm shadow-2xl relative text-center">
            <div className="w-12 h-12 bg-red-600/20 border border-red-500/30 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">¿Eliminar Ticket?</h2>
            <p className="text-gray-300 text-xs mb-6">
              ¿Estás seguro de eliminar el ticket de <strong className="text-white">{ticketToDelete.client_name}</strong> ({ticketToDelete.company})? Esto lo eliminará también de la base de datos permanentemente.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setTicketToDelete(null)}
                className="flex-1 bg-[#221c38] hover:bg-[#2e264c] text-gray-300 font-semibold py-3 rounded-2xl text-xs transition border border-[#3b305c]"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteTicket}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold py-3 rounded-2xl text-xs transition shadow-lg shadow-red-900/40"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Configuración */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#161325] border border-[#2a2240] rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => setShowSettingsModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white bg-[#221c38] p-2 rounded-full transition"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-600/20 border border-purple-500/30 text-purple-400 rounded-2xl">
                <Settings size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Ajustes de Alertas</h2>
                <p className="text-gray-400 text-xs">Configura tus vías de notificación</p>
              </div>
            </div>

            <form onSubmit={saveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase flex items-center gap-1.5">
                  <MessageSquare size={14} className="text-green-400" /> WhatsApp del Técnico
                </label>
                <input
                  type="text"
                  value={techWhatsapp}
                  onChange={(e) => setTechWhatsapp(e.target.value)}
                  placeholder="Ej. +5491122334455"
                  className="w-full bg-[#0c0a14] border border-[#2a2240] rounded-2xl py-3 px-4 text-white text-sm focus:outline-none focus:border-purple-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase flex items-center gap-1.5">
                  <Mail size={14} className="text-purple-400" /> Correo Gmail
                </label>
                <input
                  type="email"
                  value={techEmail}
                  onChange={(e) => setTechEmail(e.target.value)}
                  placeholder="tecnico@gmail.com"
                  className="w-full bg-[#0c0a14] border border-[#2a2240] rounded-2xl py-3 px-4 text-white text-sm focus:outline-none focus:border-purple-500 transition"
                />
              </div>

              <div className="pt-2 border-t border-[#2a2240]">
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase">Permiso de Notificaciones del Navegador</label>
                <div className="flex items-center justify-between bg-[#0c0a14] p-3.5 rounded-2xl border border-[#2a2240]">
                  <span className="text-xs text-gray-300">
                    Estado: <strong className={notifPermission === 'granted' ? 'text-green-400' : 'text-yellow-400'}>{notifPermission}</strong>
                  </span>
                  {notifPermission !== 'granted' && (
                    <button
                      type="button"
                      onClick={requestBrowserPermission}
                      className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition"
                    >
                      Permitir Alertas
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-3.5 rounded-2xl shadow-lg shadow-purple-900/40 transition"
              >
                Guardar Configuración
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Notificación flotante en tiempo real */}
      {newTicketAlert && (
        <div className="fixed bottom-6 right-6 z-50 bg-purple-900/90 border border-purple-500 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md animate-bounce">
          <div className="p-2 bg-purple-600 rounded-xl">
            <Bell size={20} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-purple-200">¡Nuevo Ticket Recibido!</p>
            <p className="text-sm font-semibold">{newTicketAlert.client_name} ({newTicketAlert.company})</p>
          </div>
        </div>
      )}

      {/* Calendario Minimalista Superior */}
      <div className="bg-[#161325] border border-[#2a2240] rounded-3xl p-4 mb-6 shadow-xl flex items-center justify-between overflow-x-auto">
        <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider px-2">
          <Calendar size={16} className="text-purple-400" /> Días:
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedDate(null)}
            className={`px-3 py-2 rounded-2xl text-xs font-semibold transition ${
              selectedDate === null 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' 
                : 'bg-[#0c0a14] text-gray-400 hover:text-white border border-[#2a2240]'
            }`}
          >
            Todos
          </button>
          {daysList.map((item) => {
            const isSelected = selectedDate === item.dateStr
            const countForDay = tickets.filter(t => t.created_at && t.created_at.startsWith(item.dateStr)).length
            return (
              <button
                key={item.dateStr}
                onClick={() => setSelectedDate(item.dateStr)}
                className={`flex flex-col items-center px-3.5 py-2 rounded-2xl text-xs transition border ${
                  isSelected
                    ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/50'
                    : 'bg-[#0c0a14] border-[#2a2240] text-gray-300 hover:border-purple-500/40'
                }`}
              >
                <span className="text-[10px] uppercase opacity-75">{item.dayName}</span>
                <span className="font-bold text-sm">{item.dayNum}</span>
                {countForDay > 0 && (
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                )}
              </button>
            )
          })}
        </div>

        <button
          onClick={() => setShowSettingsModal(true)}
          title="Ajustes de Notificaciones"
          className="bg-[#0c0a14] hover:bg-[#221c38] text-purple-400 p-2.5 rounded-2xl border border-[#2a2240] transition ml-2"
        >
          <Settings size={18} />
        </button>
      </div>

      {/* Grid Superior */}
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

        {/* Tarjeta de Rendimiento Neón */}
        <div 
          onClick={() => setShowPerformanceModal(true)}
          className="bg-[#161325] border border-[#2a2240] hover:border-purple-500 hover:shadow-[0_0_25px_rgba(124,58,237,0.4)] transition-all duration-300 rounded-3xl p-6 flex items-center justify-between shadow-xl cursor-pointer group"
        >
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-400 uppercase">
              <BarChart3 size={14} /> Analítica 📊
            </div>
            <h3 className="text-xl font-bold text-white mt-1">Tareas al día</h3>
            <span className="text-xs text-gray-400 font-medium mt-1 inline-block">{completedCount} de {totalCount} completados</span>
          </div>
          <div className="relative w-16 h-16 flex items-center justify-center rounded-full bg-[#0c0a14] border-4 border-purple-600/30 group-hover:border-purple-500 transition-colors">
            <span className="text-sm font-bold text-purple-300">{performancePercentage}%</span>
          </div>
        </div>
      </div>

      {/* Listado de Tickets Recibidos con Papelera y WhatsApp */}
      <div className="bg-[#161325] border border-[#2a2240] rounded-3xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar size={18} className="text-purple-400" /> Tickets Recibidos {selectedDate && `(${selectedDate})`}
          </h2>
          <span className="text-xs bg-[#221c38] text-gray-300 px-3 py-1 rounded-full border border-[#362b52]">
            {filteredTickets.length} Filtrados
          </span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500 text-sm">Cargando tickets...</div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm bg-[#0c0a14]/40 rounded-2xl border border-dashed border-[#2a2240]">
            No hay tickets registrados para este filtro.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTickets.map((ticket) => {
              const techWa = localStorage.getItem('tech_whatsapp')
              const waLink = techWa ? `https://wa.me/${techWa.replace(/[^0-9]/g, '')}?text=Hola,%20atiendo%20tu%20ticket%20de%20soporte:%20${encodeURIComponent(ticket.ticket_type)}%20para%20la%20empresa%20${encodeURIComponent(ticket.company)}` : null

              return (
                <div 
                  key={ticket.id} 
                  className="bg-[#0c0a14] border border-[#2a2240] hover:border-purple-500/40 rounded-2xl p-5 transition flex flex-col justify-between shadow-md relative group"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-bold text-purple-400 bg-purple-950/60 px-2.5 py-1 rounded-md border border-purple-800/30">
                        {ticket.ticket_type}
                      </span>
                      <div className="flex items-center gap-2">
                        {getPriorityBadge(ticket.priority)}
                        {/* Botón de papelera para eliminar ticket */}
                        <button
                          onClick={() => setTicketToDelete(ticket)}
                          title="Eliminar ticket"
                          className="text-gray-500 hover:text-red-400 bg-[#161325] hover:bg-red-950/40 p-1.5 rounded-lg border border-[#2a2240] transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
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

                  <div className="pt-3 border-t border-[#2a2240] flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className={`w-2 h-2 rounded-full ${
                        ticket.status === 'Ticket atendido' ? 'bg-green-500' :
                        ticket.status === 'Atendiendo el ticket' ? 'bg-orange-500' : 'bg-yellow-500'
                      }`}></span>
                      <span className="font-semibold text-gray-300">{ticket.status}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {waLink && (
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Contactar al cliente por WhatsApp"
                          className="bg-green-600/20 hover:bg-green-600 text-green-300 hover:text-white text-xs font-semibold p-2 rounded-xl border border-green-700/40 transition"
                        >
                          <MessageSquare size={14} />
                        </a>
                      )}
                      <button
                        onClick={() => handleStatusChange(ticket.id, ticket.status)}
                        className="bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-purple-700/40 transition flex items-center gap-1"
                      >
                        Avanzar <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}