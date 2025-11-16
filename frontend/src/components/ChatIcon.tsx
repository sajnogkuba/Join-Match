import React from 'react';
import { MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../Context/ChatContext';

const ChatIcon: React.FC = () => {
  const navigate = useNavigate();
  const { totalUnreadCount } = useChat();

  return (
    <button
      onClick={() => navigate('/chat')}
      className="relative p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition"
      aria-label="Chat"
      title="Chat"
    >
      <MessageSquare size={22} />
      {totalUnreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center font-bold">
          {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
        </span>
      )}
    </button>
  );
};

export default ChatIcon;
