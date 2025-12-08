import { Info, Star, Calendar, Users, Flag, Award } from "lucide-react"

interface UserProfileSidebarProps {
	active: string
	onSelect: (key: string) => void
}

const UserProfileSidebar = ({ active, onSelect }: UserProfileSidebarProps) => {
	const items = [
		{ label: "Informacje", icon: Info },
		{ label: "Historia wydarzeń", icon: Calendar },
		{ label: "Wspólne wydarzenia", icon: Users },
		{ label: "Oceny (uczestnik)", icon: Star },
		{ label: "Oceny (organizator)", icon: Star },
		{ label: "Odznaki", icon: Award },
		{ label: "Zgłoś użytkownika", icon: Flag, danger: true },
	]


	return (
		<aside className="w-full md:w-64 shrink-0">
			<nav className="space-y-1">
				{items.map(({ label, icon: Icon, danger }) => (

						<button
						key={label}
						onClick={() => onSelect(label)}
						className={`w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left transition
        ${danger
							? active === label
								? "bg-red-600 text-white"
								: "text-red-400 hover:bg-red-600/20 hover:text-red-300"
							: active === label
								? "bg-zinc-800 text-white"
								: "text-zinc-300 hover:bg-zinc-800/60"
						}`}
					>
						<Icon size={18} />
						<span className="text-sm">{label}</span>
					</button>

				))}
			</nav>
		</aside>
	)
}

export default UserProfileSidebar
