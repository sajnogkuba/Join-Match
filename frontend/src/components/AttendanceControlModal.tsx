import React, { useState } from 'react'
import { X, Check, AlertTriangle, UserCheck, Info } from 'lucide-react'
import Avatar from './Avatar' // Upewnij się, że ścieżka jest poprawna
import { toast } from 'sonner'
import axiosInstance from '../Api/axios'
import type { Participant } from '../Api/types/Participant' // Upewnij się, że importujesz poprawny typ

interface AttendanceControlModalProps {
	isOpen: boolean
	onClose: () => void
	eventId: number
	participants: Participant[] // Przekazujemy tu tylko osoby ze statusem "Zapisany"
}

const AttendanceControlModal: React.FC<AttendanceControlModalProps> = ({ isOpen, onClose, eventId, participants }) => {
	// Inicjalnie zakładamy, że wszyscy zapisani są obecni
	const [presentUserIds, setPresentUserIds] = useState<number[]>(participants.map(p => p.userId))
	const [isSubmitting, setIsSubmitting] = useState(false)

	if (!isOpen) return null

	const toggleUser = (userId: number) => {
		setPresentUserIds(
			prev =>
				prev.includes(userId)
					? prev.filter(id => id !== userId) // Odznacz (nieobecny)
					: [...prev, userId] // Zaznacz (obecny)
		)
	}

	const handleSubmit = async () => {
		setIsSubmitting(true)
		try {
			// Wysyłamy listę ID osób OBECNYCH
			await axiosInstance.post(`/user-event/${eventId}/attendance`, presentUserIds)
			toast.success('Lista obecności zapisana. Kary zostały naliczone.')
			onClose()
		} catch (error) {
			console.error('Błąd zapisu obecności:', error)
			toast.error('Wystąpił błąd podczas zapisywania listy obecności.')
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200'>
			<div className='w-full max-w-lg rounded-3xl bg-gradient-to-b from-zinc-900/80 to-black/80 p-6 shadow-2xl ring-1 ring-zinc-700'>
				{/* Header */}
				<div className='mb-6 flex items-center justify-between'>
					<div className='flex items-center gap-3'>
						<div className='grid h-10 w-10 place-items-center rounded-full bg-violet-500/20 text-violet-400'>
							<UserCheck size={20} />
						</div>
						<h3 className='text-xl font-bold text-white'>Kontrola obecności</h3>
					</div>
					<button
						onClick={onClose}
						className='rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition'>
						<X size={20} />
					</button>
				</div>

				{/* Info Banner */}
				<div className='mb-6 rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-sm text-amber-200 flex gap-3'>
					<AlertTriangle className='shrink-0 mt-0.5' size={18} />
					<p>
						Zaznacz osoby, które <strong>są obecne</strong>. Osoby odznaczone otrzymają automatycznie ocenę
						<span className='font-bold text-white'> 1 gwiazdka</span> (Negatywna) za brak obecności.
					</p>
				</div>

				{/* Lista uczestników */}
				<div className='max-h-[50vh] overflow-y-auto space-y-2 pr-2 custom-scrollbar'>
					{participants.length === 0 ? (
						<div className='text-center py-8 text-zinc-500 flex flex-col items-center'>
							<Info size={32} className='mb-2 opacity-50' />
							<p>Brak zapisanych uczestników do sprawdzenia.</p>
						</div>
					) : (
						participants.map(p => {
							const isSelected = presentUserIds.includes(p.userId)
							return (
								<div
									key={p.userId} // Używamy userId jako klucza
									onClick={() => toggleUser(p.userId)}
									className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all select-none ${
										isSelected
											? 'border-violet-500/30 bg-violet-500/10'
											: 'border-rose-500/30 bg-rose-500/5 opacity-70 hover:opacity-100'
									}`}>
									<div className='flex items-center gap-3'>
										<Avatar src={p.userAvatarUrl} name={p.userName} size='sm' />
										<div>
											<p
												className={`font-medium ${
													isSelected ? 'text-white' : 'text-zinc-400 line-through decoration-zinc-500'
												}`}>
												{p.userName}
											</p>
											<p className={`text-xs ${isSelected ? 'text-violet-300' : 'text-rose-300'}`}>
												{isSelected ? 'Obecny' : 'Nieobecny (kara)'}
											</p>
										</div>
									</div>
									<div
										className={`flex h-6 w-6 items-center justify-center rounded-full border transition-all ${
											isSelected
												? 'border-violet-500 bg-violet-500 text-white scale-100'
												: 'border-zinc-600 bg-transparent scale-90'
										}`}>
										{isSelected && <Check size={14} strokeWidth={3} />}
									</div>
								</div>
							)
						})
					)}
				</div>

				{/* Footer Buttons */}
				<div className='mt-8 flex gap-3'>
					<button
						onClick={onClose}
						className='w-1/3 rounded-xl border border-zinc-700 bg-transparent py-3 font-semibold text-zinc-300 hover:bg-zinc-800 transition'>
						Anuluj
					</button>
					<button
						onClick={handleSubmit}
						disabled={isSubmitting || participants.length === 0}
						className='w-2/3 rounded-xl bg-violet-600 py-3 font-semibold text-white hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-violet-900/20 flex justify-center items-center gap-2'>
						{isSubmitting ? 'Zapisywanie...' : 'Zatwierdź obecność'}
					</button>
				</div>
			</div>
		</div>
	)
}

export default AttendanceControlModal
