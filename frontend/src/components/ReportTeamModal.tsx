import React, { useState } from 'react'
import { X, AlertTriangle, Loader2, Flag } from 'lucide-react'
import api from '../Api/axios'

interface ReportTeamModalProps {
    isOpen: boolean
    onClose: () => void
    teamId: number
    teamName?: string
}

const ReportTeamModal: React.FC<ReportTeamModalProps> = ({ isOpen, onClose, teamId, teamName }) => {
    const [description, setDescription] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    if (!isOpen) return null

    const resetStateAndClose = () => {
        setDescription('')
        setError(null)
        setSuccess(null)
        onClose()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSuccess(null)

        const trimmed = description.trim()
        if (!trimmed) {
            setError('Podaj powód zgłoszenia.')
            return
        }

        const token = localStorage.getItem('accessToken')
        if (!token) {
            setError('Musisz być zalogowany, aby zgłosić drużynę.')
            return
        }

        setSubmitting(true)
        try {
            // BE: POST /api/team/report/team
            await api.post('/team/report/team', {
                token,          // String token
                IdTeam: teamId, // Integer IdTeam (uwaga na wielkość liter)
                description: trimmed,
            })

            setSuccess('Zgłoszenie zostało wysłane. Dziękujemy za pomoc!')
            setTimeout(() => {
                resetStateAndClose()
            }, 1200)
        } catch (err: any) {
            console.error('Error reporting team:', err)
            if (err.response?.status === 400) {
                const msg = err.response?.data?.message || err.response?.data || 'Nieprawidłowe dane zgłoszenia.'
                setError(msg)
            } else {
                setError('Nie udało się wysłać zgłoszenia. Spróbuj ponownie.')
            }
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
            {/* Tło */}
            <div
                className='absolute inset-0 bg-black/60 backdrop-blur-sm'
                onClick={resetStateAndClose}
            />

            {/* Modal */}
            <div className='relative w-full max-w-lg bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200'>
                <div className='flex items-center justify-between p-5 border-b border-zinc-800'>
                    <div className='flex items-center gap-2'>
                        <Flag className='text-rose-400' size={20} />
                        <h3 className='text-white text-lg font-semibold'>Zgłoś drużynę</h3>
                    </div>
                    <button
                        onClick={resetStateAndClose}
                        className='p-2 rounded-xl hover:bg-zinc-800 transition-colors'
                    >
                        <X size={20} className='text-zinc-400 hover:text-white' />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className='p-5 space-y-4'>
                    {teamName && (
                        <div className='rounded-xl bg-zinc-800/60 border border-zinc-700 px-4 py-3 text-sm text-zinc-200'>
                            Zgłaszasz drużynę: <span className='font-semibold text-white'>{teamName}</span>
                        </div>
                    )}

                    <div className='space-y-2'>
                        <label className='text-sm text-zinc-300 font-medium'>
                            Opisz powód zgłoszenia
                        </label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            maxLength={100}
                            className='w-full rounded-xl border border-zinc-700 bg-zinc-800/70 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 min-h-[90px] resize-y'
                            placeholder='Napisz krótko, co jest nie tak (max 100 znaków)...'
                        />
                        <div className='flex justify-between text-xs text-zinc-500'>
                            <span>Max 100 znaków</span>
                            <span>{description.length}/100</span>
                        </div>
                    </div>

                    {error && (
                        <div className='rounded-xl bg-red-900/40 border border-red-700 px-3 py-2 text-xs text-red-200 flex items-start gap-2'>
                            <AlertTriangle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className='rounded-xl bg-emerald-900/40 border border-emerald-700 px-3 py-2 text-xs text-emerald-200'>
                            {success}
                        </div>
                    )}

                    <div className='flex justify-end gap-3 pt-2'>
                        <button
                            type='button'
                            onClick={resetStateAndClose}
                            disabled={submitting}
                            className='px-4 py-2 rounded-xl text-sm font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                        >
                            Anuluj
                        </button>
                        <button
                            type='submit'
                            disabled={submitting || !description.trim()}
                            className='inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                        >
                            {submitting ? (
                                <>
                                    <Loader2 size={16} className='animate-spin' />
                                    Wysyłanie...
                                </>
                            ) : (
                                <>
                                    <Flag size={16} />
                                    Wyślij zgłoszenie
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ReportTeamModal
