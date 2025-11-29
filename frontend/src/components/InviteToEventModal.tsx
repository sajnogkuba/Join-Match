import { useState } from 'react'
import { UserRound, X } from 'lucide-react'

interface InviteToEventModalProps {
	isOpen: boolean
	onClose: () => void
	onSubmit: (targetUserEmail: string) => void
	isSubmitting?: boolean
}

export default function InviteToEventModal({ isOpen, onClose, onSubmit, isSubmitting }: InviteToEventModalProps) {
	const [email, setEmail] = useState('')

	if (!isOpen) return null

	return (
		<div className='fixed inset-0 z-50 grid place-items-center bg-black/70 p-4'>
			<div className='w-full max-w-md rounded-2xl bg-zinc-900/90 p-5 ring-1 ring-zinc-800'>
				<div className='mb-4 flex items-center justify-between'>
					<h3 className='text-white text-lg font-semibold flex items-center gap-2'>
						<UserRound size={18} /> Zaproś użytkownika
					</h3>
					<button onClick={onClose} className='rounded-full p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white'>
						<X size={18} />
					</button>
				</div>

				<p className='text-sm text-zinc-400 mb-4'>
					Podaj adres e-mail użytkownika, którego chcesz zaprosić do wydarzenia.
				</p>

				<input
					type='email'
					placeholder='Adres email'
					value={email}
					onChange={e => setEmail(e.target.value)}
					className='w-full rounded-xl bg-zinc-800/70 border border-zinc-700 px-3 py-2 text-sm text-zinc-200 outline-none mb-4'
				/>

				<button
					onClick={() => onSubmit(email)}
					disabled={isSubmitting || !email}
					className='w-full rounded-xl bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 text-sm font-medium disabled:bg-zinc-700 disabled:text-zinc-400'>
					{isSubmitting ? 'Wysyłanie...' : 'Wyślij zaproszenie'}
				</button>
			</div>
		</div>
	)
}
