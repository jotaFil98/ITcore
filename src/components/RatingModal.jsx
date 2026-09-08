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
      <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative border border-gray-100">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full transition"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <span className="bg-emerald-50 text-emerald-700 text-xs px-3 py-1 rounded-full font-bold border border-emerald-100">
            ¡Servicio Finalizado!
          </span>
          <h2 className="text-2xl font-bold mt-3 text-gray-900">Evalúa tu experiencia</h2>
          <p className="text-gray-500 text-sm mt-1">¿Cómo calificarías la atención recibida?</p>
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
                  size={34}
                  className={`${
                    (hover || rating) >= star
                      ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]'
                      : 'text-gray-300'
                  } transition-colors`}
                />
              </button>
            ))}
          </div>

          {/* Comentario */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
              Déjanos un comentario (Opcional)
            </label>
            <textarea
              rows="3"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Cuéntanos qué te pareció el servicio..."
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3 text-gray-900 text-sm focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-emerald-500/30 transition transform active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Enviar Valoración'}
          </button>
        </form>
      </div>
    </div>
  )
}