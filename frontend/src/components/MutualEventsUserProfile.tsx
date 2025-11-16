import React, { useState } from "react"

type EventLite = {
    eventId: number
    eventName: string
}

interface Props {
    events: EventLite[]
    previewCount?: number
}

const MutualEventsUserProfile: React.FC<Props> = ({ events, previewCount = 3 }) => {
    const [showAll, setShowAll] = useState(false)

    if (!events?.length) {
        return <p className="text-sm text-zinc-500 italic">Brak wspólnych wydarzeń.</p>
    }

    const visible = showAll ? events : events.slice(0, previewCount)

    return (
        <section>
            <h3 className="text-lg font-semibold text-white mb-3">Wspólne wydarzenia</h3>

            <ul className="space-y-3">
                {visible.map(e => (
                    <li
                        key={e.eventId}
                        className="flex items-center justify-between bg-zinc-800/50 p-3 rounded-lg"
                    >
                        <span className="text-white">{e.eventName}</span>
                        <a
                            href={`/event/${e.eventId}`}
                            className="text-violet-400 hover:text-violet-300 text-sm"
                        >
                            Zobacz →
                        </a>
                    </li>
                ))}
            </ul>

            {events.length > previewCount && (
                <div className="mt-3 text-center">
                    <button
                        onClick={() => setShowAll(s => !s)}
                        className="inline-flex items-center gap-2 rounded-lg bg-zinc-800/60 px-4 py-2 text-sm text-violet-300 hover:bg-zinc-800 transition"
                    >
                        {showAll ? "Pokaż mniej" : `Pokaż więcej (${events.length - previewCount})`}
                    </button>
                </div>
            )}
        </section>
    )
}

export default MutualEventsUserProfile
