import React from 'react';
import type { ChatMessage } from '../Context/ChatContext';

interface Props {
  message: ChatMessage;
  isOwn: boolean;
}

const MessageBubble: React.FC<Props> = ({ message, isOwn }) => {
  return (
    <div className={`flex items-end gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      {!isOwn && (
        <img
          src={message.senderAvatarUrl || '/default-avatar.png'}
          alt={message.senderName}
          className="w-8 h-8 rounded-full"
        />
      )}
      <div
        className={`max-w-[70%] p-3 rounded-2xl text-sm shadow-sm ${
          isOwn
            ? 'bg-violet-600 text-white rounded-br-none'
            : 'bg-zinc-800 text-zinc-100 rounded-bl-none'
        }`}
      >
        {!isOwn && <div className="text-xs opacity-80 mb-0.5">{message.senderName}</div>}
        <div>{message.content}</div>
      </div>
    </div>
  );
};

export default MessageBubble;
