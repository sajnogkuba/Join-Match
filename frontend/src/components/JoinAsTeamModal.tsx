import React, { useState } from 'react'
import { X } from 'lucide-react'

type Team = {
    teamId: number
    name: string
    city?: string
    photoUrl?: string
}

type Props = {
    isOpen: boolean
    onClose: () => void
    teams: Team[]
    loading?: boolean
    onConfirm: (teamId: number) => Promise<void>
}

const JoinAsTeamModal: React.FC<Props> = ({
                                              isOpen,
                                              onClose,
                                              teams,
                                              loading = false,
                                              onConfirm,
                                          }) => {
    const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null)
    const [sending, setSending] = useState(false)

    if (!isOpen) return null

    const handleConfirm = async () => {
        if (!selectedTeamId) return
        try {
            setSending(true)
            await onConfirm(selectedTeamId)
            onClose()
        } finally {
            setSending(false)
        }
    }

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4'>
            <div className='w-full max-w-md rounded-2xl bg-zinc-900 p-5 ring-1 ring-zinc-800'>
                <div className='mb-4 flex items-center justify-between'>
                    <h3 className='text-lg font-semibold text-white'>
                        Dołącz do wydarzenia jako drużyna
                    </h3>
                    <button
                        onClick={onClose}
                        className='rounded-full p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                    >
                        <X size={18} />
                    </button>
                </div>

                {loading ? (
                    <p className='text-sm text-zinc-400'>Ładowanie drużyn…</p>
                ) : teams.length === 0 ? (
                    <p className='text-sm text-zinc-400'>
                        Nie jesteś liderem żadnej drużyny.
                    </p>
                ) : (
                    <div className='space-y-2'>
                        {teams.map(team => (
                            <label
                                key={team.teamId}
                                className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer
									${
                                    selectedTeamId === team.teamId
                                        ? 'border-violet-500 bg-violet-500/10'
                                        : 'border-zinc-700 hover:bg-zinc-800'
                                }`}
                            >
                                <input
                                    type='radio'
                                    name='team'
                                    className='hidden'
                                    checked={selectedTeamId === team.teamId}
                                    onChange={() => setSelectedTeamId(team.teamId)}
                                />
                                {team.photoUrl ? (
                                    <img
                                        src={team.photoUrl}
                                        className='h-10 w-10 rounded-lg object-cover border border-zinc-700'
                                    />
                                ) : (
                                    <div className='h-10 w-10 rounded-lg bg-zinc-700 flex items-center justify-center text-xs'>
                                        TEAM
                                    </div>
                                )}
                                <div>
                                    <p className='text-white font-medium'>{team.name}</p>
                                    <p className='text-xs text-zinc-400'>{team.city ?? '—'}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                )}

                <div className='mt-5 flex gap-3'>
                    <button
                        onClick={onClose}
                        className='flex-1 rounded-xl bg-zinc-700 py-2 text-sm text-white hover:bg-zinc-600'
                    >
                        Anuluj
                    </button>
                    <button
                        disabled={!selectedTeamId || sending}
                        onClick={handleConfirm}
                        className='flex-1 rounded-xl bg-violet-600 py-2 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-50'
                    >
                        Dołącz
                    </button>
                </div>
            </div>
        </div>
    )
}

export default JoinAsTeamModal
