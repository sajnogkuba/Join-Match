import { Loader2 } from 'lucide-react'
import type { Event } from '../Api/types'
import { Editor } from '@tiptap/react'

interface EventLinkModalProps {
	isOpen: boolean
	onClose: () => void
	editor: Editor | null
	events: Event[]
	loadingEvents: boolean
}

export const EventLinkModal = ({ isOpen, onClose, editor, events, loadingEvents }: EventLinkModalProps) => {
	if (!isOpen) return null

	const insertEventLink = (event: Event) => {
		if (!editor) return

		const eventLinkHTML = `
			<div class="event-link-container border border-violet-500/30 rounded-lg p-4 bg-violet-500/10 my-4">
				<div class="flex items-start gap-3">
					${event.imageUrl ? `<img src="${event.imageUrl}" alt="${event.eventName}" class="w-16 h-16 object-cover rounded-lg" />` : ''}
					<div class="flex-1">
						<h4 class="text-white font-semibold mb-1">${event.eventName}</h4>
						<p class="text-sm text-zinc-400 mb-2">${new Date(event.eventDate).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
						<p class="text-xs text-zinc-500">${event.sportTypeName} • ${event.city || 'Brak miasta'}</p>
						<a href="/event/${event.eventId}" class="text-violet-400 hover:text-violet-300 text-sm mt-2 inline-block">Zobacz szczegóły →</a>
					</div>
				</div>
			</div>
		`
		editor.chain().focus().insertContent(eventLinkHTML).run()
		onClose()
	}

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
			<div className='absolute inset-0 bg-black/60 backdrop-blur-sm' onClick={onClose} />
			<div className='relative bg-zinc-900 rounded-2xl border border-zinc-800 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto'>
				<h3 className='text-white text-lg font-semibold mb-4'>Wybierz event</h3>
				{loadingEvents ? (
					<div className='flex items-center justify-center py-8'>
						<Loader2 className='animate-spin text-violet-400' size={24} />
						<span className='ml-2 text-zinc-400'>Ładowanie eventów...</span>
					</div>
				) : events.length === 0 ? (
					<div className='text-center py-8 text-zinc-400'>Brak dostępnych eventów</div>
				) : (
					<div className='space-y-3'>
						{events.map((event) => (
							<button
								key={event.eventId}
								onClick={() => insertEventLink(event)}
								className='w-full text-left p-4 rounded-lg border border-zinc-700 bg-zinc-800/40 hover:bg-zinc-800 transition-colors'
							>
								<div className='flex items-start gap-3'>
									{event.imageUrl && (
										<img src={event.imageUrl} alt={event.eventName} className='w-16 h-16 object-cover rounded-lg' />
									)}
									<div className='flex-1'>
										<h4 className='text-white font-semibold mb-1'>{event.eventName}</h4>
										<p className='text-sm text-zinc-400'>
											{new Date(event.eventDate).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
										</p>
										<p className='text-xs text-zinc-500 mt-1'>{event.sportTypeName} • {event.city || 'Brak miasta'}</p>
									</div>
								</div>
							</button>
						))}
					</div>
				)}
				<button
					onClick={onClose}
					className='mt-4 w-full px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white font-medium transition-colors'
				>
					Anuluj
				</button>
			</div>
		</div>
	)
}

