import { UserRound, LogOut, Lock, UserPlus, Star, CalendarDays, Ticket, Award } from "lucide-react";
import type { SidebarItemKey } from "../Api/types/Profile";

interface ProfileSidebarProps {
	active: SidebarItemKey;
	onSelect: (key: SidebarItemKey) => void;
}

const ProfileSidebar = ({ active, onSelect }: ProfileSidebarProps) => {
	const items: { key: SidebarItemKey; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
		{ key: "general", label: "Ogólne", icon: UserRound },
		{ key: "password", label: "Hasło", icon: Lock },
		{ key: "friends", label: "Znajomi", icon: UserPlus },
		{ key: "ratings", label: "Oceny", icon: Star },
		{ key: "my-events", label: "Moje wydarzenia", icon: CalendarDays },
		{ key: "participations", label: "Biorę udział", icon: Ticket },
		{ key: "badges", label: "Odznaki", icon: Award },
	];
	
	return (
		<aside className="w-full md:w-64 shrink-0">
			<nav className="space-y-1">
				{items.map(({ key, label, icon: Icon }) => (
					<button
						key={key}
						onClick={() => onSelect(key)}
						className={`w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left transition ${active === key ? "bg-zinc-800 text-white" : "text-zinc-300 hover:bg-zinc-800/60"
							}`}
					>
						<Icon size={18} />
						<span className="text-sm">{label}</span>
					</button>
				))}
			</nav>
			<button className="mt-6 text-sm text-red-400 hover:text-red-300 inline-flex items-center gap-2">
				<LogOut size={16} />
				Usuń konto
			</button>
		</aside>
	);
};

export default ProfileSidebar;
