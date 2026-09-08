import React, { useState, useEffect } from 'react'
import { Calendar, CheckCircle, Clock, Building2, User, ChevronRight, Star, RefreshCw, BarChart3, Bell, Settings, MessageSquare, Mail, X, Trash2, CheckCircle2, ShieldCheck } from 'lucide-react'
import { supabase } from '../supabaseClient'
import PerformanceModal from './PerformanceModal'

export default function TechDashboard() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState('All')
  const [showPerformanceModal, setShowPerformanceModal] = useState(false)
  const [newTicketAlert, setNewTicketAlert] = useState(null)
  const [animatingId, setAnimatingId] = useState(null)

  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [techWhatsapp, setTechWhatsapp] = useState(localStorage.getItem('tech_whatsapp') || '')
  const [techEmail, setTechEmail] = useState(localStorage.getItem('tech_email') || '')
  const [notifPermission, setNotifPermission] = useState(typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default')

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
      alert('Tu navegador no soporta notificaciones.')
      return
    }
    Notification.requestPermission().then((permission) => {
      setNotifPermission(permission)
      if (permission === 'granted') {
        new Notification('¡Notificaciones activadas!', { body: 'Ahora recibirás alertas flotantes de Google cuando se creen tickets.' })
      }
    })
  }

  const saveSettings = (e) => {
    e.preventDefault()
    localStorage.setItem('tech_whatsapp', techWhatsapp)
    localStorage.setItem('tech_email', techEmail)
    setShowSettingsModal(false)
    alert('Ajustes y preferencias de notificación guardados correctamente.')
  }

  const handleStatusChange = async (ticketId, currentStatus) => {
    setAnimatingId(ticketId)

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
      setAnimatingId(null)
    } else {
      setTimeout(() => {
        setAnimatingId(null)
        fetchTickets()
      }, 350)
    }
  }

  const confirmDeleteTicket = async () => {
    if (!ticketToDelete) return

    const { error } = await supabase
      .from('tickets')
      .delete()
      .eq('id', ticketToDelete.id)

    if (error) {
      alert('Hubo un error al eliminar el ticket.')
    } else {
      if (localStorage.getItem('active_ticket_id') === ticketToDelete.id) {
        localStorage.removeItem('active_ticket_id')
      }
      setTicketToDelete(null)
      fetchTickets()
    }
  }

  const filteredTickets = tickets.filter(t => {
    if (selectedTab === 'Pending') return t.status === 'Ticket entregado'
    if (selectedTab === 'Ongoing') return t.status === 'Atendiendo el ticket'
    if (selectedTab === 'Completed') return t.status === 'Ticket atendido'
    return true
  })

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

      {/* Modal de eliminación */}
      {ticketToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-sm shadow-2xl text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">¿Eliminar Ticket?</h2>
            <p className="text-gray-600 text-xs mb-6">Se borrará permanentemente de la base de datos.</p>
            <div className="flex gap-3">
              <button onClick={() => setTicketToDelete(null)} className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-2xl text-xs">Cancelar</button>
              <button onClick={confirmDeleteTicket} className="flex-1 bg-red-600 text-white font-bold py-3 rounded-2xl text-xs shadow-md shadow-red-500/30">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de ajustes (Tus datos de receptor de alertas) */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setShowSettingsModal(false)} className="absolute top-4 right-4 text-gray-400 bg-gray-100 p-2 rounded-full"><X size={20} /></button>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                <Settings size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Ajustes de Notificaciones</h2>
                <p className="text-gray-500 text-xs">¿A dónde quieres recibir tus avisos de nuevos tickets?</p>
              </div>
            </div>

            <form onSubmit={saveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Tu WhatsApp (Receptor de alertas)</label>
                <input type="text" value={techWhatsapp} onChange={(e) => setTechWhatsapp(e.target.value)} placeholder="Ej. +54911..." className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-sm" />
                <p className="text-[10px] text-gray-400 mt-1">Número donde deseas recibir reportes internos del sistema.</p>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Tu Correo (Receptor de alertas)</label>
                <input type="email" value={techEmail} onChange={(e) => setTechEmail(e.target.value)} placeholder="tu-correo@gmail.com" className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-sm" />
              </div>

              <div className="pt-2 border-t border-gray-100">
                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-emerald-600" /> Permisos de Notificación Google
                </label>
                <div className="flex items-center justify-between bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
                  <div>
                    <span className="text-xs font-bold text-gray-800 block">Estado actual:</span>
                    <span className={`text-xs font-semibold capitalize ${
                      notifPermission === 'granted' ? 'text-emerald-600' : notifPermission === 'denied' ? 'text-red-500' : 'text-amber-500'
                    }`}>
                      {notifPermission === 'granted' ? 'Permitidas (Activas)' : notifPermission === 'denied' ? 'Bloqueadas' : 'Pendiente'}
                    </span>
                  </div>
                  
                  {notifPermission !== 'granted' && (
                    <button
                      type="button"
                      onClick={requestBrowserPermission}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-sm transition"
                    >
                      Permitir Notificaciones
                    </button>
                  )}
                </div>
              </div>

              <button type="submit" className="w-full mt-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-emerald-500/30">
                Guardar Preferencias
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Notificación flotante */}
      {newTicketAlert && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <Bell size={20} />
          <div>
            <p className="text-xs font-bold text-emerald-200">¡Nuevo Ticket!</p>
            <p className="text-sm font-semibold">{newTicketAlert.client_name} ({newTicketAlert.company})</p>
          </div>
        </div>
      )}

      {/* HEADER VERDE ESMERALDA */}
      <div className="bg-emerald-800 rounded-3xl p-6 text-white mb-6 shadow-xl border border-emerald-700 relative overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-bold">Hello, Administrador</h1>
            <p className="text-xs text-emerald-200">{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <button onClick={() => setShowSettingsModal(true)} className="bg-emerald-700 hover:bg-emerald-600 p-2.5 rounded-2xl text-emerald-200 hover:text-white transition flex items-center gap-1.5 text-xs font-bold">
            <Settings size={16} /> Ajustes
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-emerald-700 text-center">
          <div className="bg-emerald-900/40 p-3 rounded-2xl">
            <span className="text-xl font-extrabold">{pendingCount}</span>
            <span className="text-[10px] text-emerald-300 font-semibold block uppercase">Pending</span>
          </div>
          <div className="bg-emerald-900/40 p-3 rounded-2xl">
            <span className="text-xl font-extrabold">{ongoingCount}</span>
            <span className="text-[10px] text-emerald-300 font-semibold block uppercase">Ongoing</span>
          </div>
          <div className="bg-emerald-900/40 p-3 rounded-2xl">
            <span className="text-xl font-extrabold">{completedCount}</span>
            <span className="text-[10px] text-emerald-300 font-semibold block uppercase">Completed</span>
          </div>
        </div>
      </div>

      {/* Tarjeta de analítica */}
      <div onClick={() => setShowPerformanceModal(true)} className="bg-white rounded-3xl p-5 mb-6 shadow-lg border border-gray-100 flex items-center justify-between cursor-pointer hover:border-emerald-500 transition group">
        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase flex items-center gap-1"><BarChart3 size={14} /> Analítica Avanzada</span>
          <h3 className="text-lg font-bold text-gray-900 mt-0.5">Rendimiento de Tareas</h3>
          <span className="text-xs text-gray-500">Haz clic para ver gráficos y valoraciones</span>
        </div>
        <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center font-bold text-emerald-600 border border-emerald-200">
          {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
        </div>
      </div>

      {/* Gestión de Tickets */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-lg font-bold text-gray-900">Gestión de Tickets</h2>
          <div className="bg-gray-100 p-1 rounded-2xl flex space-x-1 w-full md:w-auto overflow-x-auto">
            {['All', 'Pending', 'Ongoing', 'Completed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${selectedTab === tab ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' : 'text-gray-500 hover:text-gray-900'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Cargando tickets...</div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm bg-gray-50 rounded-2xl border border-dashed border-gray-200">No hay tickets en esta categoría.</div>
        ) : (
          <div className="space-y-4">
            {filteredTickets.map((ticket) => {
              // Enlace genérico para reportar/chatear sobre este ticket específico (sin usar tu número de técnico)
              const ticketWaMsg = encodeURIComponent(`Hola ${ticket.client_name}, te escribo de SoporteTech respecto a tu ticket de ${ticket.ticket_type} para la empresa ${ticket.company}.`)
              const generalWaLink = `https://wa.me/?text=${ticketWaMsg}`

              let progressPercent = 0
              let statusBadgeBg = 'bg-yellow-50 text-yellow-700 border-yellow-200'
              if (ticket.status === 'Atendiendo el ticket') {
                progressPercent = 50
                statusBadgeBg = 'bg-orange-50 text-orange-700 border-orange-200'
              } else if (ticket.status === 'Ticket atendido') {
                progressPercent = 100
                statusBadgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }

              const isAnimating = animatingId === ticket.id

              return (
                <div 
                  key={ticket.id} 
                  className={`bg-gray-50 border border-gray-200 rounded-2xl p-5 transition shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isAnimating ? 'animate-pulse-subtle border-emerald-500 bg-emerald-50/40' : ''}`}
                >
                  <div className="space-y-2 flex-grow">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-md">{ticket.ticket_type}</span>
                      {getPriorityBadge(ticket.priority)}
                    </div>
                    <h3 className="text-base font-bold text-gray-900">{ticket.client_name}</h3>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Building2 size={13} className="text-emerald-600" /> {ticket.company}</span>
                      <span className="flex items-center gap-1"><Clock size={13} className="text-emerald-600" /> {new Date(ticket.created_at).toLocaleDateString()}</span>
                    </div>
                    {ticket.rating && (
                      <div className="flex items-center gap-1 pt-1">
                        {[...Array(ticket.rating)].map((_, i) => (<Star key={i} size={13} className="fill-yellow-400 text-yellow-400" />))}
                        {ticket.feedback_comment && <span className="text-xs text-gray-500 italic ml-2">"{ticket.feedback_comment}"</span>}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end pt-3 md:pt-0 border-t md:border-t-0 border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 flex items-center justify-center rounded-full bg-white border-2 border-emerald-500 shadow-sm">
                        <span className="text-xs font-extrabold text-emerald-700">{progressPercent}%</span>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusBadgeBg}`}>{ticket.status}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <a href={generalWaLink} target="_blank" rel="noopener noreferrer" className="bg-green-100 hover:bg-green-200 text-green-800 p-2 rounded-xl transition" title="Compartir/Enviar info por WhatsApp">
                        <MessageSquare size={16} />
                      </a>
                      <button onClick={() => setTicketToDelete(ticket)} className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-xl transition" title="Eliminar"><Trash2 size={16} /></button>
                      <button 
                        onClick={() => handleStatusChange(ticket.id, ticket.status)}
                        disabled={isAnimating}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center gap-1 active:scale-95 disabled:opacity-50"
                      >
                        {isAnimating ? 'Actualizando...' : <>Avanzar <ChevronRight size={14} /></>}
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