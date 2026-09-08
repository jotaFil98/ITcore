import React, { useState, useEffect } from 'react'
import { PlusCircle, Clock, CheckCircle2, Building2, User, Tag, ArrowRight, Star, FileText } from 'lucide-react'
import { supabase } from '../supabaseClient'
import confetti from 'canvas-confetti'
import RatingModal from './RatingModal'

export default function ClientView() {
  const [clientName, setClientName] = useState('')
  const [company, setCompany] = useState('')
  const [ticketType, setTicketType] = useState('Servicio técnico remoto')
  const [priority, setPriority] = useState('Necesario')
  
  const [activeTicket, setActiveTicket] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const savedTicketId = localStorage.getItem('active_ticket_id')
    if (savedTicketId) {
      fetchTicketDetails(savedTicketId)
    }
  }, [])

  const fetchTicketDetails = async (id) => {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', id)
      .single()

    if (!error && data) {
      setActiveTicket(data)
    } else {
      localStorage.removeItem('active_ticket_id')
    }
  }

  const handleCreateTicket = async (e) => {
    e.preventDefault()
    if (!clientName || !company || !ticketType) {
      alert('Por favor complete todos los campos obligatorios.')
      return
    }

    setLoading(true)

    const newTicketData = {
      client_name: clientName,
      company: company,
      ticket_type: ticketType,
      priority: priority,
      status: 'Ticket entregado',
      created_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('tickets')
      .insert([newTicketData])
      .select()
      .single()

    setLoading(false)

    if (error) {
      console.error('Error al crear ticket:', error)
      alert('Hubo un error al registrar el ticket.')
      return
    }

    setActiveTicket(data)
    localStorage.setItem('active_ticket_id', data.id)

    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    })
  }

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'Necesario':
        return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold">🟡 Necesario</span>
      case 'Prioritario':
        return <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-bold">🟠 Prioritario</span>
      case 'Urgente':
        return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold">🔴 Urgente</span>
      default:
        return null
    }
  }

  const renderTimeline = (currentStatus, ticket) => {
    const steps = ['Ticket entregado', 'Atendiendo el ticket', 'Ticket atendido']
    let currentIndex = steps.indexOf(currentStatus)
    if (currentIndex === -1) currentIndex = 0

    return (
      <div className="mt-6 pt-6 border-t border-gray-100">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Progreso en Tiempo Real</p>
        <div className="relative flex items-center justify-between max-w-sm mx-auto mb-6">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-gray-200 z-0"></div>
          
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentIndex
            return (
              <div key={step} className="relative z-10 flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-105' 
                    : 'bg-gray-100 text-gray-400 border border-gray-300'
                }`}>
                  {idx < currentIndex ? <CheckCircle2 size={18} /> : idx + 1}
                </div>
                <span className={`text-[11px] mt-2 font-semibold text-center max-w-[80px] ${isCompleted ? 'text-emerald-700' : 'text-gray-400'}`}>
                  {step}
                </span>
              </div>
            )
          })}
        </div>

        {currentStatus === 'Ticket atendido' && !ticket.rating && (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center animate-pulse">
            <p className="text-xs text-emerald-800 font-bold mb-2">¡Servicio completado con éxito!</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition"
            >
              Evaluar Experiencia ⭐
            </button>
          </div>
        )}

        {ticket.rating && (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center space-y-2">
            <p className="text-xs text-emerald-800 font-bold">¡Gracias por valorar nuestro servicio!</p>
            <div className="flex justify-center gap-1">
              {[...Array(ticket.rating)].map((_, i) => (
                <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('active_ticket_id')
                setActiveTicket(null)
              }}
              className="mt-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2 px-4 rounded-xl transition shadow-md shadow-emerald-600/20"
            >
              Crear Nuevo Ticket
            </button>
          </div>
        )}
      </div>
    )
  }

  const isTicketFinished = activeTicket && activeTicket.status === 'Ticket atendido' && activeTicket.rating

  return (
    <div className="max-w-md mx-auto p-4 md:p-6 pb-20 animate-fadeIn">
      {showModal && (
        <RatingModal 
          ticketId={activeTicket?.id} 
          onClose={() => setShowModal(false)}
          onRated={() => {
            setShowModal(false)
            fetchTicketDetails(activeTicket.id)
          }}
        />
      )}

      {/* Header estilo perfil de referencia en Verde Esmeralda */}
      <div className="bg-emerald-800 rounded-3xl p-5 text-white mb-6 shadow-xl border border-emerald-700 flex justify-between items-center">
        <div>
          <span className="text-xs text-emerald-200 font-medium">Portal de Atención</span>
          <h1 className="text-xl font-bold">Solicitud de Soporte</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center border border-emerald-600 text-emerald-200 shadow-inner">
          <FileText size={20} />
        </div>
      </div>

      {activeTicket && !isTicketFinished ? (
        <div className="bg-white rounded-3xl p-6 shadow-xl relative overflow-hidden mb-6 border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                Ticket en Curso (Bloqueado)
              </span>
              <h3 className="text-lg font-bold text-gray-900 mt-2">{activeTicket.ticket_type}</h3>
            </div>
            {getPriorityBadge(activeTicket.priority)}
          </div>

          <div className="space-y-2 text-sm text-gray-600 my-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-2">
              <User size={15} className="text-emerald-600" />
              <span>Cliente:</span> <strong className="text-gray-900">{activeTicket.client_name}</strong>
            </div>
            <div className="flex items-center gap-2">
              <Building2 size={15} className="text-emerald-600" />
              <span>Empresa:</span> <strong className="text-gray-900">{activeTicket.company}</strong>
            </div>
          </div>

          {renderTimeline(activeTicket.status, activeTicket)}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Generar Nuevo Ticket</h2>
          
          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Nombre Completo</label>
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ej. Carlos Mendoza"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-11 pr-4 text-gray-900 text-sm focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Empresa</label>
              <div className="relative">
                <Building2 size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Ej. Soluciones Globales S.A."
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-11 pr-4 text-gray-900 text-sm focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Tipo de Ticket / Servicio</label>
              <select
                value={ticketType}
                onChange={(e) => setTicketType(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-gray-900 text-sm focus:outline-none focus:border-emerald-500 transition"
              >
                <option value="Servicio técnico remoto">Servicio técnico remoto</option>
                <option value="Mantenimiento de Redes">Mantenimiento de Redes</option>
                <option value="Soporte de Software">Soporte de Software</option>
                <option value="Instalación de Hardware">Instalación de Hardware</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Nivel de Prioridad</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: 'Necesario', color: 'border-yellow-300 text-yellow-800 bg-yellow-50' },
                  { name: 'Prioritario', color: 'border-orange-300 text-orange-800 bg-orange-50' },
                  { name: 'Urgente', color: 'border-red-300 text-red-800 bg-red-50' }
                ].map((item) => (
                  <button
                    type="button"
                    key={item.name}
                    onClick={() => setPriority(item.name)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition ${
                      priority === item.name 
                        ? `${item.color} ring-2 ring-emerald-500 shadow-md` 
                        : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-emerald-500/30 transition transform active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? 'Generando...' : <>Crear Ticket <ArrowRight size={18} /></>}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}