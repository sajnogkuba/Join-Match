import { motion } from 'framer-motion'
import { Users, Target, Heart, Zap, Shield, Globe } from 'lucide-react'
import BackgroundImage from '../assets/Background.jpg'

const AboutUsPage: React.FC = () => {
	return (
		<div className="bg-[#0d0d10] text-zinc-100 min-h-screen">
			<section
				className="relative min-h-[60vh] flex items-center justify-center text-center bg-cover bg-center overflow-hidden"
				style={{ backgroundImage: `url(${BackgroundImage})` }}
			>
				<div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/90" />
				<div className="relative z-10 px-4 max-w-4xl">
					<motion.h1
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight"
					>
						O <span className="text-violet-500">JoinMatch</span>
					</motion.h1>
					<motion.p
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.2 }}
						className="text-lg md:text-xl text-zinc-300 mb-8"
					>
						Łączymy ludzi przez sport. Tworzymy społeczność, która inspiruje do aktywności fizycznej i buduje przyjaźnie na całe życie.
					</motion.p>
				</div>
			</section>

			<section className="py-20 bg-black relative overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-violet-900/10 via-transparent to-violet-800/5" />
				<div className="absolute top-10 right-10 w-32 h-32 bg-violet-600/5 rounded-full blur-3xl" />
				<div className="absolute bottom-10 left-10 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl" />
				<div className="container mx-auto px-4 relative z-10">
					<div className="max-w-4xl mx-auto text-center">
						<motion.h2
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
							className="text-3xl md:text-4xl font-bold text-white mb-6"
						>
							Nasza misja
						</motion.h2>
						<motion.p
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
							className="text-lg text-zinc-300 leading-relaxed"
						>
							Wierzymy, że sport to nie tylko aktywność fizyczna, ale sposób na budowanie społeczności, 
							rozwijanie umiejętności i tworzenie niezapomnianych wspomnień. <span className="text-violet-500">JoinMatch</span> powstał z myślą o tym, 
							aby każdy mógł łatwo znaleźć ludzi do wspólnej gry, niezależnie od poziomu zaawansowania czy preferowanego sportu.
						</motion.p>
					</div>
				</div>
			</section>

			<section className="py-20 bg-[#0d0d12] relative overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-tl from-violet-800/5 via-transparent to-violet-600/8" />
				<div className="absolute top-20 left-20 w-40 h-40 bg-violet-500/8 rounded-full blur-3xl" />
				<div className="absolute bottom-20 right-20 w-28 h-28 bg-violet-700/6 rounded-full blur-2xl" />
				<div className="container mx-auto px-4 relative z-10">
					<motion.h2
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						className="text-3xl md:text-4xl font-bold text-white text-center mb-16"
					>
						Nasze wartości
					</motion.h2>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{[
							{
								icon: <Users className="w-8 h-8" />,
								title: "Społeczność",
								description: "Budujemy silną społeczność sportową, gdzie każdy czuje się mile widziany i może rozwijać swoje pasje."
							},
							{
								icon: <Target className="w-8 h-8" />,
								title: "Cel",
								description: "Pomagamy w osiąganiu celów sportowych poprzez łączenie ludzi o podobnych ambicjach i poziomie umiejętności."
							},
							{
								icon: <Heart className="w-8 h-8" />,
								title: "Pasja",
								description: "Zarażamy miłością do sportu i aktywności fizycznej, pokazując, że każdy może znaleźć swoją dyscyplinę."
							},
							{
								icon: <Zap className="w-8 h-8" />,
								title: "Energia",
								description: "Dostarczamy pozytywnej energii i motywacji do działania, inspirując do regularnej aktywności fizycznej."
							},
							{
								icon: <Shield className="w-8 h-8" />,
								title: "Bezpieczeństwo",
								description: "Zapewniamy bezpieczne środowisko do spotkań i aktywności, dbając o dobro wszystkich użytkowników."
							},
							{
								icon: <Globe className="w-8 h-8" />,
								title: "Dostępność",
								description: "Ułatwiamy dostęp do sportu dla wszystkich, niezależnie od miejsca zamieszkania czy poziomu zaawansowania."
							}
						].map((value, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: index * 0.1 }}
								className="group bg-zinc-900/80 border border-zinc-800 rounded-3xl p-8 hover:border-violet-600/50 hover:-translate-y-1 transition-all"
							>
								<div className="text-violet-400 mb-4 group-hover:text-violet-300 transition-colors">
									{value.icon}
								</div>
								<h3 className="text-xl font-semibold text-white mb-3 group-hover:text-violet-400 transition-colors">
									{value.title}
								</h3>
								<p className="text-zinc-400 text-sm leading-relaxed">
									{value.description}
								</p>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			<section className="py-20 bg-black">
				<div className="container mx-auto px-4">
					<div className="max-w-4xl mx-auto">
						<motion.h2
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
							className="text-3xl md:text-4xl font-bold text-white text-center mb-16"
						>
							Nasza historia
						</motion.h2>
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
							<motion.div
								initial={{ opacity: 0, x: -30 }}
								whileInView={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.6 }}
								className="space-y-6"
							>
								<p className="text-zinc-300 leading-relaxed">
									<span className="text-violet-500">JoinMatch</span> narodził się z prostego problemu - trudności w znalezieniu ludzi do wspólnej gry. 
									Jako pasjonaci sportu, często spotykaliśmy się z sytuacją, gdy chcieliśmy pograć w piłkę, 
									tenisa czy koszykówkę, ale brakowało nam partnerów do gry.
								</p>
								<p className="text-zinc-300 leading-relaxed">
									Postanowiliśmy stworzyć platformę, która rozwiąże ten problem raz na zawsze. 
									Dziś <span className="text-violet-500">JoinMatch</span> jest w fazie rozwoju, ale naszym celem jest 
									połączenie sportowców w całej Polsce, umożliwiając im łatwe znajdowanie wydarzeń, 
									tworzenie drużyn i budowanie przyjaźni przez sport.
								</p>
								<p className="text-zinc-300 leading-relaxed">
									Jesteśmy na początku tej ekscytującej podróży i nieustannie pracujemy nad ulepszaniem platformy, 
									aby każdy użytkownik mógł cieszyć się najlepszym doświadczeniem sportowym.
								</p>
							</motion.div>
							<motion.div
								initial={{ opacity: 0, x: 30 }}
								whileInView={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.6, delay: 0.2 }}
								className="bg-gradient-to-br from-violet-600/20 to-violet-800/20 rounded-3xl p-8 border border-violet-600/30"
							>
								<div className="text-center">
									<div className="text-4xl font-bold text-violet-400 mb-2">2025</div>
									<div className="text-zinc-300 mb-6">Rok założenia</div>
									<div className="text-4xl font-bold text-violet-400 mb-2">∞</div>
									<div className="text-zinc-300 mb-6">Możliwości</div>
									<div className="text-4xl font-bold text-violet-400 mb-2">100%</div>
									<div className="text-zinc-300">Pasji do sportu</div>
								</div>
							</motion.div>
						</div>
					</div>
				</div>
			</section>

			<section className="py-20 bg-[#0d0d12]">
				<div className="container mx-auto px-4">
					<motion.h2
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						className="text-3xl md:text-4xl font-bold text-white text-center mb-16"
					>
						Poznaj nasz zespół
					</motion.h2>
					<div className="max-w-4xl mx-auto text-center">
						<motion.p
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
							className="text-lg text-zinc-300 leading-relaxed mb-12"
						>
							Nasz zespół składa się z pasjonatów sportu i technologii, którzy wierzą w siłę społeczności. 
							Każdy z nas ma bogate doświadczenie w różnych dyscyplinach sportowych i technologicznych, 
							co pozwala nam tworzyć rozwiązania, które naprawdę działają.
						</motion.p>
						<motion.div
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.4 }}
							className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-8"
						>
							<h3 className="text-xl font-semibold text-white mb-4">Dołącz do nas!</h3>
							<p className="text-zinc-400 mb-6">
								Jeśli chcesz być częścią naszej społeczności lub masz pomysły na rozwój platformy, 
								skontaktuj się z nami. Razem możemy stworzyć jeszcze lepsze doświadczenie sportowe dla wszystkich.
							</p>
							<div className="flex flex-col sm:flex-row justify-center gap-4">
								<a
									href="mailto:kontakt@joinmatch.pl"
									className="bg-gradient-to-r from-violet-600 to-violet-800 hover:from-violet-700 hover:to-violet-900 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:-translate-y-0.5"
								>
									Napisz do nas
								</a>
								<a
									href="/events"
									className="bg-white/10 border border-white/20 px-6 py-3 rounded-xl font-semibold text-white hover:bg-white/20 transition-all hover:-translate-y-0.5"
								>
									Zobacz wydarzenia
								</a>
							</div>
						</motion.div>
					</div>
				</div>
			</section>

			<section className="py-20 bg-gradient-to-br from-violet-800 via-violet-700 to-violet-900 text-center text-white relative overflow-hidden">
				<div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,#fff,transparent_60%)]" />
				<div className="relative z-10 px-4">
					<motion.h2
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						className="text-4xl font-bold mb-6"
					>
						Gotowy do gry?
					</motion.h2>
					<motion.p
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.2 }}
						className="text-lg text-violet-100 mb-8"
					>
						Dołącz do tysięcy użytkowników, którzy już grają z JoinMatch.
					</motion.p>
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.4 }}
						className="flex flex-col sm:flex-row justify-center gap-4"
					>
						<a
							href="/register"
							className="bg-white text-violet-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition"
						>
							Zarejestruj się
						</a>
						<a
							href="/events"
							className="bg-transparent border-2 border-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition"
						>
							Zobacz wydarzenia
						</a>
					</motion.div>
				</div>
			</section>
		</div>
	)
}

export default AboutUsPage
