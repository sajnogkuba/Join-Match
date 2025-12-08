import { useState } from 'react'
import type { FormEvent } from 'react'
import type { EventDetails } from '../Api/types'
import { AlertTriangle } from 'lucide-react'

type ReportEventModalProps = {
    isOpen: boolean
    onClose: () => void
    event: EventDetails
    onSubmit: (message: string) => Promise<void> | void
    isSubmitting?: boolean
}

const ReportEventModal: React.FC<ReportEventModalProps> = ({
                                                               isOpen,
                                                               onClose,
                                                               event,
                                                               onSubmit,
                                                               isSubmitting = false,
                                                           }) => {
    const [message, setMessage] = useState('')
    const [error, setError] = useState<string | null>(null)

    if (!isOpen) return null

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        const trimmed = message.trim()

        if (!trimmed) {
            setError('Napisz krótko, co jest nie tak z wydarzeniem.')
            return
        }

        setError(null)
        await onSubmit(trimmed)
        setMessage('')
    }

    return (
        <div className='fixed inset-0 z-50 grid place-items-center bg-black/70 px-4'>
            <div className='w-full max-w-md rounded-2xl bg-zinc-900/90 p-5 ring-1 ring-zinc-800 shadow-2xl'>
                {/* Nagłówek */}
                <div className='mb-4 flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                        <div className='grid h-8 w-8 place-items-center rounded-full bg-rose-500/20 text-rose-300'>
                            <AlertTriangle size={18} />
                        </div>
                        <div>
                            <h3 className='text-white text-lg font-semibold'>Zgłoś wydarzenie</h3>
                            <p className='text-xs text-zinc-400'>
                                Zgłoszenie trafi do zespołu moderacji Join Match.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className='rounded-full p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                        aria-label='Zamknij'
                    >
                        ✕
                    </button>
                </div>

                {/* Podsumowanie wydarzenia */}
                <div className='mb-4 flex gap-3'>
                    {event.imageUrl && event.imageUrl.trim() !== '' ? (
                        <img
                            src={event.imageUrl}
                            alt={event.eventName}
                            className='h-16 w-16 rounded-xl object-cover border border-zinc-700 bg-zinc-800'
                            onError={e => (e.currentTarget.style.display = 'none')}
                        />
                    ) : (
                        <div className='h-16 w-16 flex items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800 text-[11px] text-zinc-400'>
                            Brak zdjęcia
                        </div>
                    )}
                    <div className='flex-1'>
                        <p className='text-sm font-semibold text-white line-clamp-2'>{event.eventName}</p>
                        <p className='mt-1 text-xs text-zinc-400'>
                            Obiekt: {event.sportObjectName}
                        </p>
                    </div>
                </div>

                {/* Formularz zgłoszenia */}
                <form onSubmit={handleSubmit} className='space-y-3'>
                    <div>
                        <label className='mb-1 block text-xs font-medium text-zinc-300'>
                            Opis zgłoszenia (max 100 znaków)
                        </label>
                        <div className='relative'>
							<textarea
                                className='w-full resize-none rounded-xl border border-zinc-700 bg-zinc-800/80 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500'
                                rows={3}
                                maxLength={100}
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                placeholder='Np. nieprawidłowe dane, spam, łamanie regulaminu…'
                            />
                            <div className='pointer-events-none absolute bottom-1 right-2 text-[10px] text-zinc-500'>
                                {message.length}/100
                            </div>
                        </div>
                        {error && <p className='mt-1 text-xs text-rose-400'>{error}</p>}
                    </div>

                    <div className='flex justify-end gap-2 pt-1'>
                        <button
                            type='button'
                            onClick={onClose}
                            className='rounded-xl border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800'
                            disabled={isSubmitting}
                        >
                            Anuluj
                        </button>
                        <button
                            type='submit'
                            className='rounded-xl bg-rose-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-60 disabled:cursor-not-allowed'
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Wysyłanie…' : 'Wyślij zgłoszenie'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ReportEventModal
