import { useState } from 'react'
import StarRatingInput from './StarRatingInput'

interface Props {
  onSubmit: (rating: number, comment: string) => void
  disabled?: boolean
}

export default function EventRatingForm({ onSubmit, disabled }: Props) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')

  const handleSubmit = () => {
    if (!rating) return alert('Wybierz liczbę gwiazdek!')
    onSubmit(rating, comment)
    setRating(0)
    setComment('')
  }

  return (
    <div className="rounded-2xl bg-zinc-900/60 p-5 ring-1 ring-zinc-800 space-y-3">
      <h3 className="text-white font-semibold mb-3 text-lg">Oceń wydarzenie</h3>
      <StarRatingInput value={rating} onChange={setRating} label="Twoja ocena" />
      <textarea
        placeholder="Dodaj komentarz (opcjonalnie)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-lg p-2 text-sm"
      />
      <button
        onClick={handleSubmit}
        disabled={disabled}
        className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {disabled ? 'Wysyłanie...' : 'Wyślij ocenę'}
      </button>
    </div>
  )
}
