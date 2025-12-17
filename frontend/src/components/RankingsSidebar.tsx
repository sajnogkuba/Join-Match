import { Users, UserCog } from "lucide-react";

interface RankingsSidebarProps {
	active: string;
	onSelect: (key: string) => void;
}

const RankingsSidebar = ({ active, onSelect }: RankingsSidebarProps) => {
	const items = [
		{ label: "Gracze", icon: Users },
		{ label: "Organizatorzy", icon: UserCog },
	];

	return (
		<aside className="w-full md:w-64 shrink-0">
			<nav className="space-y-1">
				{items.map(({ label, icon: Icon }) => (
					<button
						key={label}
						onClick={() => onSelect(label)}
						className={`w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left transition ${
							active === label
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
	);
};

export default RankingsSidebar;

