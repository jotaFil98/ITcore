import React, { useState, useEffect } from 'react'
import { Calendar, CheckCircle, Clock, Building2, User, ChevronRight, Star, RefreshCw, BarChart3, Bell, Settings, MessageSquare, Mail, X, Trash2, CheckCircle2 } from 'lucide-react'
import { supabase } from '../supabaseClient'
import PerformanceModal from './PerformanceModal'

export default function TechDashboard() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState('All') // 'All', 'Pending', 'Ongoing', 'Completed'
  const [showPerformanceModal, setShowPerformanceModal] = useState(false)
  const [newTicketAlert, setNewTicketAlert] = useState(null)

  // Configuración de alertas
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [techWhatsapp, setTechWhatsapp] = useState(localStorage.getItem('tech_whatsapp') || '')
  const [techEmail, setTechEmail] = useState(localStorage.getItem('tech_email') || '')
  const [notifPermission, setNotifPermission] = useState(Notification.permission || 'default')

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
    alert('Configuración guardada con éxito.')
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

  const confirmDeleteTicket = async () => {
    if (!ticketToDelete) return

    const { error } = await supabase
      .from('tickets')
      .delete()
      .eq('id', ticketToDelete.id)

    if (error) {
      console.error('Error al eliminar ticket:', error)
      alert('Hubo un error al eliminar el ticket.')
    } else {
      if (localStorage.getItem('active_ticket_id') === ticketToDelete.id) {
        localStorage.removeItem('active_ticket_id')
      }
      setTicketToDelete(null)
      fetchTickets()
    }
  }

  // Filtrado por pestañas tipo píldora (All, Pending, Ongoing, Completed)
  const filteredTickets = tickets.filter(t => {
    if (selectedTab === 'Pending') return t.status === 'Ticket entregado'
    if (selectedTab === 'Ongoing') return t.status === 'Atendiendo el ticket'
    if (selectedTab === 'Completed') return t.status === 'Ticket atendido'
    return true // 'All'
  })

  // Conteo para las tarjetas superiores estilo resumen
  const pendingCount = tickets.filter(t => t.status === 'Ticket entregado').length
  const ongoingCount = tickets.filter(t => t.status === 'Atendiendo el ticket').length
  const completedCount = tickets.filter(t => t.status === 'Ticket atendido').length
  const totalCount = tickets.length

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'Necesario':
        return <span className="bg-yellow-100 text-yellow-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold">🟡 Necesario</span>
      case 'Prioritario':
        return <span className="bg-orange-100 text-orange-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold">🟠 Prioritario</span>
      case 'Urgente':
        return <span className="bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold">🔴 Urgente</span>
      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 pb-20 animate-fadeIn relative">
      {showPerformanceModal && (
        <PerformanceModal tickets={tickets} onClose={() => setShowPerformanceModal(false)} />
      )}

      {/* Modal de confirmación de eliminación */}
      {ticketToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-sm shadow-2xl relative text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">¿Eliminar Ticket?</h2>
            <p className="text-gray-600 text-xs mb-6">
              ¿Estás seguro de eliminar el ticket de <strong className="text-gray-900">{ticketToDelete.client_name}</strong>? Se borrará permanentemente.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setTicketToDelete(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-2xl text-xs transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteTicket}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-2xl text-xs transition shadow-md shadow-red-500/30"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de configuración de alertas */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => setShowSettingsModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full transition"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-gray-900 mb-1">Ajustes de Alertas</h2>
            <p className="text-gray-500 text-xs mb-6">Configura tus canales de comunicación</p>

            <form onSubmit={saveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">WhatsApp</label>
                <input
                  type="text"
                  value={techWhatsapp}
                  onChange={(e) => setTechWhatsapp(e.target.value)}
                  placeholder="+54911..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-gray-900 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Correo Electrónico</label>
                <input
                  type="email"
                  value={techEmail}
                  onChange={(e) => setTechEmail(e.target.value)}
                  placeholder="admin@correo.com"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-gray-900 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
                  <span className="text-xs text-gray-700 font-semibold">
                    Notificaciones Navegador: <strong className={notifPermission === 'granted' ? 'text-emerald-600' : 'text-orange-500'}>{notifPermission}</strong>
                  </span>
                  {notifPermission !== 'granted' && (
                    <button
                      type="button"
                      onClick={requestBrowserPermission}
                      className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl"
                    >
                      Permitir
                    </button>
                  )}
                </div>
              </div>
              <button
                type="submit"
                className="w-full mt-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-emerald-500/30 transition"
              >
                Guardar Ajustes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Alerta flotante en tiempo real */}
      {newTicketAlert && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900/95 border border-emerald-400 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md animate-bounce">
          <div className="p-2 bg-emerald-500 rounded-xl">
            <Bell size={20} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-200">¡Nuevo Ticket!</p>
            <p className="text-sm font-semibold">{newTicketAlert.client_name} ({newTicketAlert.company})</p>
          </div>
        </div>
      )}

      {/* HEADER ESTILO REFERENCIA (Hola Jhon Steward + Contadores verdes) */}
      <div className="bg-emerald-800/80 backdrop-blur-md rounded-3xl p-6 text-white mb-6 shadow-xl border border-emerald-700/50 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-bold">Hello, Administrador</h1>
            <p className="text-xs text-emerald-200 mt-0.5">{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettingsModal(true)}
              className="bg-emerald-700/60 hover:bg-emerald-700 p-2.5 rounded-2xl border border-emerald-600 transition text-emerald-200 hover:text-white"
              title="Ajustes de notificaciones"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>

        {/* 3 Contadores Superiores estilo imagen */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-emerald-700/60 text-center">
          <div className="bg-emerald-900/40 p-3 rounded-2xl border border-emerald-700/30">
            <span className="text-xl font-extrabold text-white block">{pendingCount}</span>
            <span className="text-[10px] text-emerald-300 font-semibold uppercase tracking-wider">Pending</span>
          </div>
          <div className="bg-emerald-900/40 p-3 rounded-2xl border border-emerald-700/30">
            <span className="text-xl font-extrabold text-white block">{ongoingCount}</span>
            <span className="text-[10px] text-emerald-300 font-semibold uppercase tracking-wider">Ongoing</span>
          </div>
          <div className="bg-emerald-900/40 p-3 rounded-2xl border border-emerald-700/30">
            <span className="text-xl font-extrabold text-white block">{completedCount}</span>
            <span className="text-[10px] text-emerald-300 font-semibold uppercase tracking-wider">Completed</span>
          </div>
        </div>
      </div>

      {/* Tarjeta de analítica / rendimiento con efecto neón */}
      <div 
        onClick={() => setShowPerformanceModal(true)}
        className="bg-white rounded-3xl p-5 mb-6 shadow-xl border border-gray-100 flex items-center justify-between cursor-pointer hover:border-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all duration-300 group"
      >
        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
            <BarChart3 size={14} /> Analítica Avanzada
          </span>
          <h3 className="text-lg font-bold text-gray-900 mt-0.5">Rendimiento de Tareas</h3>
          <span className="text-xs text-gray-500 font-medium">Haz clic para ver gráficos y valoraciones por empresa</span>
        </div>
        <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center font-bold text-emerald-600 border border-emerald-200">
          {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
        </div>
      </div>

      {/* SECCIÓN DE TAREAS / TICKETS (Con pestañas tipo píldora: All, Pending, Ongoing, Completed) */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-lg font-bold text-gray-900">Gestión de Tickets</h2>
          
          {/* Pestañas tipo píldora */}
          <div className="bg-gray-100 p-1 rounded-2xl flex space-x-1 w-full md:w-auto overflow-x-auto">
            {['All', 'Pending', 'Ongoing', 'Completed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  selectedTab === tab
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Cargando tickets...</div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            No hay tickets en esta categoría.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTickets.map((ticket) => {
              const techWa = localStorage.getItem('tech_whatsapp')
              const waLink = techWa ? `https://wa.me/${techWa.replace(/[^0-9]/g, '')}?text=Hola,%20atiendo%20tu%20ticket%20de%20soporte:%20${encodeURIComponent(ticket.ticket_type)}%20para%20la%20empresa%20${encodeURIComponent(ticket.company)}` : null

              // Calcular porcentaje visual según estado para el anillo circular
              let progressPercent = 0
              let statusBadgeBg = 'bg-yellow-50 text-yellow-700 border-yellow-200'
              if (ticket.status === 'Atendiendo el ticket') {
                progressPercent = 50
                statusBadgeBg = 'bg-orange-50 text-orange-700 border-orange-200'
              } else if (ticket.status === 'Ticket atendido') {
                progressPercent = 100
                statusBadgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }

              return (
                <div 
                  key={ticket.id} 
                  className="bg-gray-50 border border-gray-200/80 rounded-2xl p-5 hover:border-emerald-500/50 transition shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div className="space-y-2 flex-grow">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                        {ticket.ticket_type}
                      </span>
                      {getPriorityBadge(ticket.priority)}
                    </div>

                    <h3 className="text-base font-bold text-gray-900">{ticket.client_name}</h3>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Building2 size={13} className="text-emerald-600" /> {ticket.company}</span>
                      <span className="flex items-center gap-1"><Clock size={13} className="text-emerald-600" /> {new Date(ticket.created_at).toLocaleDateString()}</span>
                    </div>

                    {ticket.rating && (
                      <div className="flex items-center gap-1 pt-1">
                        {[...Array(ticket.rating)].map((_, i) => (
                          <Star key={i} size={13} className="fill-yellow-400 text-yellow-400" />
                        ))}
                        {ticket.feedback_comment && <span className="text-xs text-gray-500 italic ml-2">"{ticket.feedback_comment}"</span>}
                      </div>
                    )}
                  </div>

                  {/* Lado derecho de la tarjeta: Círculo de porcentaje y botones de acción */}
                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end pt-3 md:pt-0 border-t md:border-t-0 border-gray-200">
                    {/* Indicador circular de porcentaje */}
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 flex items-center justify-center rounded-full bg-white border-2 border-emerald-500 shadow-sm">
                        <span className="text-xs font-extrabold text-emerald-700">{progressPercent}%</span>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusBadgeBg}`}>
                        {ticket.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {waLink && (
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-green-100 hover:bg-green-200 text-green-800 p-2 rounded-xl transition"
                          title="Contactar WhatsApp"
                        >
                          <MessageSquare size={16} />
                        </a>
                      )}
                      <button
                        onClick={() => setTicketToDelete(ticket)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-xl transition"
                        title="Eliminar ticket"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        onClick={() => handleStatusChange(ticket.id, ticket.status)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center gap-1"
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