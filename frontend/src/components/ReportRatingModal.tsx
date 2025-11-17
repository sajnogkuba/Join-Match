import { useState, FormEvent } from 'react'
import { AlertTriangle } from 'lucide-react'

type Props = {
    isOpen: boolean
    onClose: () => void
    rating: {
        id: number
        userName: string
        raterAvatarUrl?: string
        rating: number
        comment: string | null
    }
    onSubmit: (text: string) => Promise<void> | void
    isSubmitting?: boolean
}

export default function ReportRatingModal({ isOpen, onClose, rating, onSubmit, isSubmitting = false }: Props) {
    const [text, setText] = useState('')
    const [error, setError] = useState<string | null>(null)

    if (!isOpen) return null

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        if (!text.trim()) {
            setError('Opis zgłoszenia jest wymagany.')
            return
        }
        setError(null)
        await onSubmit(text.trim())
        setText('')
    }

    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4">
            <div className="w-full max-w-md rounded-2xl bg-zinc-900/90 p-5 ring-1 ring-zinc-800">

                {/* Nagłówek */}
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="grid h-8 w-8 place-items-center rounded-full bg-rose-500/20 text-rose-300">
                            <AlertTriangle size={18} />
                        </div>
                        <h3 className="text-white text-lg font-semibold">Zgłoś ocenę</h3>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-full p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    >
                        ✕
                    </button>
                </div>

                {/* Miniaturka użytkownika */}
                <div className="flex gap-3 mb-4">
                    {rating.raterAvatarUrl ? (
                        <img
                            src={rating.raterAvatarUrl}
                            className="h-14 w-14 rounded-xl object-cover border border-zinc-700"
                        />
                    ) : (
                        <div className="h-14 w-14 grid place-items-center rounded-xl bg-zinc-800 text-zinc-400 border border-zinc-700">
                            Brak zdjęcia
                        </div>
                    )}

                    <div className="flex-1">
                        <p className="text-white font-semibold">{rating.userName}</p>
                        <p className="text-zinc-400 text-sm">Ocena: {rating.rating}/5</p>
                    </div>
                </div>

                {/* Formularz */}
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="text-xs text-zinc-300">Opis zgłoszenia (max 100 znaków)</label>
                        <textarea
                            maxLength={100}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="w-full mt-1 rounded-xl bg-zinc-800/70 border border-zinc-700 text-sm p-2 text-white resize-none focus:ring-1 focus:ring-rose-500"
                            rows={3}
                            placeholder="Naruszenie regulaminu, obraźliwe treści..."
                        />

                        <div className="text-xs text-zinc-500 text-right">
                            {text.length}/100
                        </div>

                        {error && (
                            <p className="text-xs text-rose-400 mt-1">{error}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3 py-1.5 rounded-xl text-sm border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        >
                            Anuluj
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-1.5 rounded-xl bg-rose-600 text-white text-sm hover:bg-rose-500 disabled:opacity-50"
                        >
                            {isSubmitting ? "Wysyłanie..." : "Wyślij zgłoszenie"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
