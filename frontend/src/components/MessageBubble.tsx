import React from 'react'
import type { ChatMessage } from '../Context/ChatContext'
import Avatar from './Avatar'
import { formatLocalDate } from '../utils/formatDate'

interface Props {
	message: ChatMessage
	isOwn: boolean
}

const MessageBubble: React.FC<Props> = ({ message, isOwn }) => {
	const timeLabel = message.createdAt ? formatLocalDate(message.createdAt, 'HH:mm') : ''

	return (
		<div className={`flex items-end gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
			{!isOwn && (
				<Avatar src={message.senderAvatarUrl || null} name={message.senderName} size='sm' className='h-8 w-8' />
			)}
			<div
				className={`max-w-[70%] p-3 rounded-2xl text-sm shadow-sm ${
					isOwn ? 'bg-violet-600 text-white rounded-br-none' : 'bg-zinc-800 text-zinc-100 rounded-bl-none'
				}`}>
				{!isOwn && <div className='text-xs opacity-80 mb-0.5'>{message.senderName}</div>}
				<div>{message.content}</div>
				{timeLabel && (
					<div
						className={`text-[11px] mt-1 flex ${
							isOwn ? 'justify-end text-violet-200/80' : 'justify-start text-zinc-300/80'
						}`}>
						{timeLabel}
					</div>
				)}
			</div>
		</div>
	)
}

export default MessageBubble
