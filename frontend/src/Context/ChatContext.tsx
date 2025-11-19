import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { Client } from '@stomp/stompjs'
import { useChatWebSocket } from '../hooks/useChatWebSocket'
import api from '../Api/axios'

export interface ChatMessage {
  id: number
  conversationId: number
  senderId: number
  senderName: string
  senderAvatarUrl?: string
  content: string
  createdAt: string
}

interface ConversationPreviewForHydrate {
  id: number
  unreadCount?: number
}

interface ChatContextType {
  messages: Record<number, ChatMessage[]>
  sendMessage: (conversationId: number, content: string) => void
  addMessage: (msg: ChatMessage) => void
  addMessages: (conversationId: number, msgs: ChatMessage[]) => void
  clearMessages: (conversationId: number) => void
  stompClient: Client | null
  isConnected: boolean

  unreadCounts: Record<number, number>
  totalUnreadCount: number
  totalUnreadConversations: number

  activeConversationId: number | null
  setActiveConversation: (id: number | null) => void
  markConversationRead: (id: number) => void

  hydrateUnreadCounts: (previews: ConversationPreviewForHydrate[]) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const useChat = () => {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within ChatProvider')
  return ctx
}

interface ChatProviderProps {
  userId: number | null
  userName: string | null
  children: React.ReactNode
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ userId, userName, children }) => {
  const [messages, setMessages] = useState<Record<number, ChatMessage[]>>({})
  const { stompClient, isConnected } = useChatWebSocket()
  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({})
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null)

  useEffect(() => {
    if (!userId) return
  
    const loadInitialUnread = async () => {
      try {
        const res = await api.get('/conversations/preview', {
          params: { userId }
        })
        hydrateUnreadCounts(res.data)
        console.log("📥 Initial unread hydrated:", res.data)
      } catch (err) {
        console.error("❌ initial hydrate failed", err)
      }
    }
  
    loadInitialUnread()
  }, [userId])
  

  const clearMessages = useCallback((conversationId: number) => {
    setMessages(prev => ({ ...prev, [conversationId]: [] }))
  }, [])

  const addMessages = useCallback((conversationId: number, msgs: ChatMessage[]) => {
    setMessages(prev => ({ ...prev, [conversationId]: msgs }))
  }, [])

  const addMessage = useCallback(
    (msg: ChatMessage) => {
      setMessages(prev => ({
        ...prev,
        [msg.conversationId]: [...(prev[msg.conversationId] || []), msg],
      }))

      setUnreadCounts(prev => {
        const isMine = userId != null && msg.senderId === userId
        const isActive = activeConversationId === msg.conversationId

        if (isMine || isActive) return prev

        const next = {
          ...prev,
          [msg.conversationId]: (prev[msg.conversationId] || 0) + 1,
        }

        console.log('💬 addMessage -> unreadCounts', next)
        return next
      })
    },
    [userId, activeConversationId]
  )

  const markConversationRead = useCallback((id: number) => {
    setUnreadCounts(prev => {
      const updated = { ...prev }
      delete updated[id]
      console.log('👁 markConversationRead -> unreadCounts', updated)
      return updated
    })
  }, [])

  const sendMessage = useCallback(
    (conversationId: number, content: string) => {
      if (!stompClient || !isConnected || !userId || !userName) return
      const payload = { conversationId, senderId: userId, senderName: userName, content }
      stompClient.publish({ destination: '/app/chat.sendMessage', body: JSON.stringify(payload) })
    },
    [stompClient, isConnected, userId, userName]
  )

  const setActiveConversation = useCallback((id: number | null) => {
    setActiveConversationId(id)

    if (id != null) {
      setUnreadCounts(prev => {
        const updated = { ...prev }
        delete updated[id]
        console.log('📂 setActiveConversation -> unreadCounts', updated)
        return updated
      })
    }
  }, [])

  const hydrateUnreadCounts = useCallback((previews: ConversationPreviewForHydrate[]) => {
    setUnreadCounts(prev => {
      const updated = { ...prev }

      previews.forEach(p => {
        if (p.unreadCount && p.unreadCount > 0) {
          updated[p.id] = p.unreadCount
        }
      })

      console.log('🧊 hydrateUnreadCounts -> unreadCounts', updated)
      return updated
    })
  }, [])

  const totalUnreadCount = Object.values(unreadCounts).reduce((a, b) => a + b, 0)
  const totalUnreadConversations = Object.values(unreadCounts).filter(c => c > 0).length

  console.log('🔔 totalUnreadConversations', totalUnreadConversations, 'unreadCounts', unreadCounts)

  return (
    <ChatContext.Provider
      value={{
        messages,
        sendMessage,
        addMessage,
        addMessages,
        clearMessages,
        stompClient,
        isConnected,
        unreadCounts,
        totalUnreadCount,
        totalUnreadConversations,
        activeConversationId,
        setActiveConversation,
        markConversationRead,
        hydrateUnreadCounts,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}
