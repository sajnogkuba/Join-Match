import {type FormEvent, useState } from "react"

interface UserReportFormProps {
    onSubmit: (message: string) => Promise<void> | void
    disabled?: boolean
}

const UserReportForm = ({ onSubmit, disabled }: UserReportFormProps) => {
    const [message, setMessage] = useState("")

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        if (disabled) return
        const trimmed = message.trim()
        if (!trimmed) return
        await onSubmit(trimmed)
        setMessage("")
    }

    const remaining = 100 - message.length

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-zinc-200 mb-1">
                    Powód zgłoszenia
                </label>
                <textarea
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-sm text-zinc-100 resize-none focus:outline-none focus:ring-2 focus:ring-violet-600"
                    rows={4}
                    maxLength={100}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Opisz krótko powód zgłoszenia (max 100 znaków)..."
                    disabled={disabled}
                />
                <div className="mt-1 flex justify-between text-xs text-zinc-500">
                    <span>{message.length}/100</span>
                    {remaining <= 20 && (
                        <span>Pozostało {remaining} znaków</span>
                    )}
                </div>
            </div>

            <button
                type="submit"
                disabled={disabled || !message.trim()}
                className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
                Wyślij zgłoszenie
            </button>
        </form>
    )
}

export default UserReportForm
