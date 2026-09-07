import React, { useState } from 'react'
import { Star, X } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function RatingModal({ ticketId, onClose, onRated }) {
  const [rating, setRating] = useState(5)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase
        .from('tickets')
        .update({
          rating: rating,
          feedback_comment: comment
        })
        .eq('id', ticketId)

      if (error) throw error
      onRated()
    } catch (err) {
      console.error('Error al guardar valoración:', err)
      alert('Hubo un error al guardar tu calificación.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#161325] border border-[#2a2240] rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white bg-[#221c38] p-2 rounded-full transition"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <span className="bg-purple-900/40 text-purple-300 text-xs px-3 py-1 rounded-full font-medium border border-purple-700/30">
            ¡Ticket Creado con Éxito!
          </span>
          <h2 className="text-2xl font-bold mt-3 text-white">Evalúa tu experiencia</h2>
          <p className="text-gray-400 text-sm mt-1">¿Qué te ha parecido la atención inicial?</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Estrellas */}
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                className="transition transform hover:scale-110 focus:outline-none"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
              >
                <Star
                  size={32}
                  className={`${
                    (hover || rating) >= star
                      ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]'
                      : 'text-gray-600'
                  } transition-colors`}
                />
              </button>
            ))}
          </div>

          {/* Comentario */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
              Déjanos un comentario (Opcional)
            </label>
            <textarea
              rows="3"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Cuéntanos más detalles..."
              className="w-full bg-[#0c0a14] border border-[#2a2240] rounded-2xl p-3 text-white text-sm focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-3.5 rounded-2xl shadow-lg shadow-purple-900/30 transition transform active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Enviar Valoración'}
          </button>
        </form>
      </div>
    </div>
  )
}