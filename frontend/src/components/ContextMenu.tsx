import { useState, useRef, useEffect } from 'react'
import type { ReactNode } from 'react'
import { MoreVertical } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ContextMenuItem {
	label: string
	icon?: ReactNode
	onClick: () => void
	variant?: 'default' | 'danger'
}

interface ContextMenuProps {
	items: ContextMenuItem[]
	children?: ReactNode
}

const ContextMenu: React.FC<ContextMenuProps> = ({ items, children }) => {
	const [isOpen, setIsOpen] = useState(false)
	const menuRef = useRef<HTMLDivElement>(null)
	const buttonRef = useRef<HTMLButtonElement>(null)

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				menuRef.current &&
				buttonRef.current &&
				!menuRef.current.contains(event.target as Node) &&
				!buttonRef.current.contains(event.target as Node)
			) {
				setIsOpen(false)
			}
		}

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside)
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [isOpen])

	const handleItemClick = (item: ContextMenuItem) => {
		item.onClick()
		setIsOpen(false)
	}

	return (
		<div className='relative'>
			<button
				ref={buttonRef}
				onClick={() => setIsOpen(!isOpen)}
				className='p-1.5 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-300'
				aria-label='Menu opcji'
			>
				{children || <MoreVertical size={18} />}
			</button>
			<AnimatePresence>
				{isOpen && (
					<motion.div
						ref={menuRef}
						initial={{ opacity: 0, y: -10, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -10, scale: 0.95 }}
						transition={{ duration: 0.15 }}
						className='absolute right-0 mt-2 min-w-48 bg-zinc-900/95 backdrop-blur-md border border-zinc-800 rounded-xl shadow-xl overflow-hidden z-50'
					>
						{items.map((item, index) => (
							<button
								key={index}
								onClick={() => handleItemClick(item)}
								className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${
									item.variant === 'danger'
										? 'text-red-400 hover:bg-red-600/20'
										: 'text-zinc-300 hover:bg-zinc-800'
								}`}
							>
								{item.icon && <span className='flex-shrink-0'>{item.icon}</span>}
								<span className='text-left'>{item.label}</span>
							</button>
						))}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}

export default ContextMenu

