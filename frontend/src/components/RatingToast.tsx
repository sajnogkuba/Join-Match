import { toast } from 'sonner'
import { Star, Pencil, Trash2 } from 'lucide-react'
import { motion, AnimatePresence, easeOut } from 'framer-motion'

interface RatingToastOptions {
	type: 'add' | 'update' | 'delete'
	target?: string // np. "użytkownika", "wydarzeniu", "organizatorze"
}

// ✅ główny helper do wywoływania toastów
export const showRatingToast = ({ type, target = 'użytkownika' }: RatingToastOptions) => {
	const baseStyle = {
		style: {
			background: 'linear-gradient(135deg, #2b1b47 0%, #3b1f60 100%)',
			color: '#fff',
			border: '1px solid #7c3aed',
			boxShadow: '0 0 20px rgba(124, 58, 237, 0.4)',
			borderRadius: '12px',
			overflow: 'hidden',
			padding: 0,
		},
		duration: 3500,
	}

	const animations = {
		initial: { opacity: 0, y: 20, scale: 0.95 },
		animate: { opacity: 1, y: 0, scale: 1 },
		exit: { opacity: 0, y: -20, scale: 0.9 },
		transition: { duration: 0.5, ease: easeOut },
	}

	const renderContent = (icon: React.ReactNode, title: string, message: string) => (
		<AnimatePresence>
			<motion.div
				className="flex items-center gap-3 px-4 py-3 relative"
				initial={animations.initial}
				animate={animations.animate}
				exit={animations.exit}
				transition={animations.transition}>
				<div className="p-2 rounded-full bg-violet-600/20 ring-1 ring-violet-700 flex items-center justify-center">
					{icon}
				</div>
				<div>
					<p className="font-semibold text-white text-sm">{title}</p>
					<p className="text-xs text-zinc-300">{message}</p>
				</div>
				{/* subtelny błysk */}
				<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer pointer-events-none" />
			</motion.div>
		</AnimatePresence>
	)

	switch (type) {
		case 'add':
			toast.custom(
				() =>
					renderContent(
						<Star size={18} className="text-violet-300 animate-pulse" />,
						'Dodano opinię!',
						`Dziękujemy za ocenę ${target} 💜`
					),
				baseStyle
			)
			break
		case 'update':
			toast.custom(
				() =>
					renderContent(
						<Pencil size={18} className="text-violet-300" />,
						'Zaktualizowano opinię ✏️',
						`Twoja opinia o ${target} została zmieniona`
					),
				baseStyle
			)
			break
		case 'delete':
			toast.custom(
				() =>
					renderContent(
						<Trash2 size={18} className="text-rose-400" />,
						'Usunięto opinię 🗑️',
						`Twoja opinia o ${target} została usunięta`
					),
				baseStyle
			)
			break
		default:
			toast.success('Operacja wykonana pomyślnie', baseStyle)
	}
}
