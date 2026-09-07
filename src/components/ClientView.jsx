import React, { useState, useEffect } from 'react'
import { PlusCircle, Clock, CheckCircle2, AlertCircle, Building2, User, Tag, ArrowRight } from 'lucide-react'
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

  // Consultar si hay un ticket activo reciente en localStorage o estado local
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

    // Guardar ticket activo y disparar confeti + modal
    setActiveTicket(data)
    localStorage.setItem('active_ticket_id', data.id)

    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    })

    setShowModal(true)
  }

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'Necesario':
        return <span className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-3 py-1 rounded-full text-xs font-semibold">🟡 Necesario</span>
      case 'Prioritario':
        return <span className="bg-orange-500/20 text-orange-300 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-semibold">🟠 Prioritario</span>
      case 'Urgente':
        return <span className="bg-red-500/20 text-red-300 border border-red-500/30 px-3 py-1 rounded-full text-xs font-semibold">🔴 Urgente</span>
      default:
        return null
    }
  }

  // Renderizar progreso de pasos (Línea de tiempo estilo delivery)
  const renderTimeline = (currentStatus) => {
    const steps = ['Ticket entregado', 'Atendiendo el ticket', 'Ticket atendido']
    let currentIndex = steps.indexOf(currentStatus)
    if (currentIndex === -1) currentIndex = 0

    return (
      <div className="mt-6 pt-6 border-t border-[#2a2240]">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Estado del Proceso</p>
        <div className="relative flex items-center justify-between max-w-sm mx-auto">
          {/* Línea conectora de fondo */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-[#2a2240] z-0"></div>
          
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentIndex
            return (
              <div key={step} className="relative z-10 flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50 scale-105' 
                    : 'bg-[#221c38] text-gray-500 border border-[#362b52]'
                }`}>
                  {idx < currentIndex ? <CheckCircle2 size={18} /> : idx + 1}
                </div>
                <span className={`text-[11px] mt-2 font-medium text-center max-w-[80px] ${isCompleted ? 'text-purple-300' : 'text-gray-500'}`}>
                  {step}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-4 md:p-6 pb-20 animate-fadeIn">
      {showModal && (
        <RatingModal 
          ticketId={activeTicket?.id} 
          onClose={() => setShowModal(false)}
          onRated={() => setShowModal(false)}
        />
      )}

      {/* Header estilo imagen de referencia */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Portal de Clientes</h1>
          <p className="text-xs text-gray-400 mt-0.5">Genera y rastrea tu solicitud de soporte</p>
        </div>
        <div className="bg-[#161325] border border-[#2a2240] p-2.5 rounded-2xl text-purple-400 shadow-inner">
          <Tag size={20} />
        </div>
      </div>

      {/* Si ya hay un ticket activo, se muestra como "Hoja de ticket" con su línea de tiempo */}
      {activeTicket ? (
        <div className="bg-[#161325] border border-[#2a2240] rounded-3xl p-6 shadow-xl relative overflow-hidden mb-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-purple-400 bg-purple-950/50 px-2.5 py-1 rounded-md border border-purple-800/30">
                Ticket Activo
              </span>
              <h3 className="text-xl font-bold text-white mt-2">{activeTicket.ticket_type}</h3>
            </div>
            {getPriorityBadge(activeTicket.priority)}
          </div>

          <div className="space-y-2 text-sm text-gray-300 my-4 bg-[#0c0a14]/60 p-4 rounded-2xl border border-[#2a2240]/50">
            <div className="flex items-center gap-2">
              <User size={15} className="text-purple-400" />
              <span className="text-gray-400">Cliente:</span> <strong className="text-white">{activeTicket.client_name}</strong>
            </div>
            <div className="flex items-center gap-2">
              <Building2 size={15} className="text-purple-400" />
              <span className="text-gray-400">Empresa:</span> <strong className="text-white">{activeTicket.company}</strong>
            </div>
          </div>

          {/* Línea de tiempo de entrega */}
          {renderTimeline(activeTicket.status)}

          <button
            onClick={() => {
              localStorage.removeItem('active_ticket_id')
              setActiveTicket(null)
            }}
            className="w-full mt-6 bg-[#221c38] hover:bg-[#2e264c] text-gray-300 font-medium py-2.5 rounded-xl text-xs transition border border-[#3b305c]"
          >
            Crear un nuevo ticket
          </button>
        </div>
      ) : (
        /* Formulario de Creación de Ticket */
        <div className="bg-[#161325] border border-[#2a2240] rounded-3xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-4">Nuevo Requerimiento</h2>
          
          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Nombre Completo</label>
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ej. Carlos Mendoza"
                  className="w-full bg-[#0c0a14] border border-[#2a2240] rounded-2xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-purple-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Empresa</label>
              <div className="relative">
                <Building2 size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Ej. Soluciones Globales S.A."
                  className="w-full bg-[#0c0a14] border border-[#2a2240] rounded-2xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-purple-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Tipo de Ticket / Servicio</label>
              <select
                value={ticketType}
                onChange={(e) => setTicketType(e.target.value)}
                className="w-full bg-[#0c0a14] border border-[#2a2240] rounded-2xl py-3 px-4 text-white text-sm focus:outline-none focus:border-purple-500 transition"
              >
                <option value="Servicio técnico remoto">Servicio técnico remoto</option>
                <option value="Mantenimiento de Redes">Mantenimiento de Redes</option>
                <option value="Soporte de Software">Soporte de Software</option>
                <option value="Instalación de Hardware">Instalación de Hardware</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Nivel de Prioridad</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: 'Necesario', color: 'border-yellow-500/40 text-yellow-300 bg-yellow-500/10' },
                  { name: 'Prioritario', color: 'border-orange-500/40 text-orange-300 bg-orange-500/10' },
                  { name: 'Urgente', color: 'border-red-500/40 text-red-300 bg-red-500/10' }
                ].map((item) => (
                  <button
                    type="button"
                    key={item.name}
                    onClick={() => setPriority(item.name)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition ${
                      priority === item.name 
                        ? `${item.color} ring-2 ring-purple-500 shadow-md` 
                        : 'border-[#2a2240] bg-[#0c0a14] text-gray-400 hover:border-gray-600'
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
              className="w-full mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-3.5 rounded-2xl shadow-lg shadow-purple-900/40 transition transform active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? 'Generando...' : <>Generar Ticket <ArrowRight size={18} /></>}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}