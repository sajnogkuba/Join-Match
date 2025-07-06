// src/pages/MainPage.tsx
import { useState } from 'react'
import BackgroundImage from '../assets/Background.jpg'

// Mock data for suggested events
const SUGGESTED_EVENTS = [
	{
		id: 1,
		title: 'Weekend Basketball Tournament',
		location: 'City Sports Center',
		date: 'May 15, 2025',
		image: '/api/placeholder/400/250',
		category: 'Basketball',
		participants: 24,
		slots: 32,
	},
	{
		id: 2,
		title: 'Amateur Football League',
		location: 'Community Stadium',
		date: 'May 18, 2025',
		image: '/api/placeholder/400/250',
		category: 'Football',
		participants: 38,
		slots: 44,
	},
	{
		id: 3,
		title: 'Tennis Doubles Championship',
		location: 'Tennis Club Courts',
		date: 'May 20, 2025',
		image: '/api/placeholder/400/250',
		category: 'Tennis',
		participants: 12,
		slots: 16,
	},
	{
		id: 4,
		title: 'Morning Yoga in the Park',
		location: 'Central Park',
		date: 'May 12, 2025',
		image: '/api/placeholder/400/250',
		category: 'Yoga',
		participants: 15,
		slots: 30,
	},
	{
		id: 5,
		title: '5K Charity Run',
		location: 'Riverside Path',
		date: 'May 22, 2025',
		image: '/api/placeholder/400/250',
		category: 'Running',
		participants: 78,
		slots: 100,
	},
	{
		id: 6,
		title: 'Volleyball Beach Tournament',
		location: 'City Beach',
		date: 'May 25, 2025',
		image: '/api/placeholder/400/250',
		category: 'Volleyball',
		participants: 32,
		slots: 48,
	},
]

// Categories for the filter
const CATEGORIES = ['All', 'Basketball', 'Football', 'Tennis', 'Volleyball', 'Running', 'Yoga', 'Swimming']

export const MainPage: React.FC = () => {
	const [searchQuery, setSearchQuery] = useState('')
	const [selectedCategory, setSelectedCategory] = useState('All')

	const filteredEvents = SUGGESTED_EVENTS.filter(event => {
		const matchesSearch =
			event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			event.location.toLowerCase().includes(searchQuery.toLowerCase())

		const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory

		return matchesSearch && matchesCategory
	})

	return (
		<div className='bg-gray-900'>
			{/* Hero Section */}
			<section
				className="relative text-white py-20 bg-cover bg-center before:content-[''] before:absolute before:inset-0 before:bg-black/45"
				style={{
					backgroundImage: `url(${BackgroundImage})`,
				}}>
				<div className='relative z-10 container mx-auto px-4 text-center'>
					<div className='container mx-auto px-4 text-center'>
						<h1 className='text-4xl md:text-5xl font-bold mb-4'>Znajdź idealne wydarzenie sportowe</h1>
						<p className='text-xl md:max-w-2xl mx-auto mb-8'>
							Dołącz, organizuj i odkrywaj amatorskie wydarzenia sportowe w swojej okolicy. Łatwe rezerwacje i
							zarządzanie zespołem.
						</p>
						<div className='flex justify-center'>
							<button className='bg-white text-purple-900 font-bold py-3 px-8 rounded-lg mr-4 hover:bg-gray-100 transition-colors shadow-lg cursor-pointer'>
								Znajdź Eventy
							</button>
							<button className='bg-purple-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-purple-600 transition-colors shadow-lg cursor-pointer'>
								Znajdź Mecze
							</button>
						</div>
					</div>
				</div>
			</section>

			{/* Search Section  */}
			<section className='py-12 bg-black relative z-10 shadow-2xl'>
				<div className='absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-purple-900/30 to-transparent'></div>
				<div className='absolute bottom-0 right-0 w-1/4 h-32 bg-gradient-to-tl from-purple-600/20 to-transparent rounded-full blur-3xl'></div>
				<div className='absolute top-12 left-12 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl'></div>

				<div className='container mx-auto px-4 relative z-10'>
					<div className='flex flex-col md:flex-row items-center justify-between mb-8'>
						<h2 className='text-3xl font-bold text-white mb-4 md:mb-0'>
							<span className='text-purple-400'>Znajdź</span> idealne wydarzenie
						</h2>
						<div className='flex space-x-4'>
							<button className='flex items-center space-x-2 bg-black border border-gray-700 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-900 transition cursor-pointer'>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									className='h-5 w-5'
									fill='none'
									viewBox='0 0 24 24'
									stroke='currentColor'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6v6m0 0v6m0-6h6m-6 0H6' />
								</svg>
								<span>Filtry</span>
							</button>
							<button className='flex items-center space-x-2 bg-purple-700 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition cursor-pointer'>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									className='h-5 w-5'
									fill='none'
									viewBox='0 0 24 24'
									stroke='currentColor'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
								</svg>
								<span>Stwórz wydarzenie</span>
							</button>
						</div>
					</div>

					<div className='bg-black rounded-2xl shadow-lg border border-gray-800 p-6 backdrop-blur-sm'>
						<div className='flex flex-col md:flex-row gap-4'>
							{/* Search Input */}
							<div className='flex-grow relative'>
								<div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
									<svg className='h-5 w-5 text-purple-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
										/>
									</svg>
								</div>
								<input
									type='text'
									className='pl-12 pr-4 py-4 w-full rounded-xl bg-white border border-white text-black placeholder-black focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
									placeholder='Co chcesz zagrać dzisiaj?'
									value={searchQuery}
									onChange={e => setSearchQuery(e.target.value)}
								/>
							</div>

							{/* Category Dropdown */}
							<div className='md:w-64'>
								<div className='relative'>
									<select
										className='appearance-none w-full py-4 px-4 rounded-xl bg-white border border-white text-black focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
										value={selectedCategory}
										onChange={e => setSelectedCategory(e.target.value)}>
										{CATEGORIES.map(category => (
											<option key={category} value={category}>
												{category}
											</option>
										))}
									</select>
									<div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-black'>
										<svg className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
											<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
										</svg>
									</div>
								</div>
							</div>

							{/* Search Button */}
							<button className='bg-gradient-to-r from-purple-600 to-purple-800 text-white font-medium py-4 px-8 rounded-xl hover:from-purple-700 hover:to-purple-900 transition-all shadow-lg shadow-purple-900/30 cursor-pointer'>
								Szukaj
							</button>
						</div>

						{/* Popular Tags */}
						<div className='mt-6 flex flex-wrap gap-2'>
							<span className='text-gray-400 self-center'>Popularne:</span>
							<button className='px-3 py-1 rounded-full bg-black hover:bg-gray-950 text-purple-400 border border-gray-700 text-sm transition cursor-pointer'>
								Piłka nożna
							</button>
							<button className='px-3 py-1 rounded-full bg-black hover:bg-gray-950 text-purple-400 border border-gray-700 text-sm transition cursor-pointer'>
								Koszykówka
							</button>
							<button className='px-3 py-1 rounded-full bg-black hover:bg-gray-950 text-purple-400 border border-gray-700 text-sm transition cursor-pointer'>
								Siatkówka
							</button>
							<button className='px-3 py-1 rounded-full bg-black hover:bg-gray-950 text-purple-400 border border-gray-700 text-sm transition cursor-pointer'>
								Tenis
							</button>
							<button className='px-3 py-1 rounded-full bg-black hover:bg-gray-950 text-purple-400 border border-gray-700 text-sm transition cursor-pointer'>
								Bieganie
							</button>
						</div>
					</div>
				</div>
			</section>

			{/* Suggested Events Section */}
			<section className='py-16 bg-black'>
				<div className='container mx-auto px-4'>
					<div className='flex flex-col md:flex-row justify-between items-center mb-10'>
						<div>
							<h2 className='text-3xl font-bold text-white mb-2'>Wydarzenia polecane</h2>
							<p className='text-gray-400'>Odkryj popularne wydarzenia w Twojej okolicy</p>
						</div>
						<div className='mt-4 md:mt-0 flex space-x-3'>
							<button className='flex items-center space-x-2 bg-black border border-gray-700 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-900 transition cursor-pointer'>
								<svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' viewBox='0 0 20 20' fill='currentColor'>
									<path d='M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z' />
								</svg>
								<span>Filtruj</span>
							</button>
							<button className='flex items-center space-x-2 bg-black border border-gray-700 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-900 transition cursor-pointer'>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									className='h-5 w-5'
									fill='none'
									viewBox='0 0 24 24'
									stroke='currentColor'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M9 20l-5.447-2.724A2 2 0 013 15.382V5.618a2 2 0 011.553-1.894l5-1.25a2 2 0 01.894 0l5 1.25A2 2 0 0121 5.618v9.764a2 2 0 01-1.553 1.894L15 20M9 20V10M9 20l6-2.727M15 10V20'
									/>
								</svg>
								<span>Mapa</span>
							</button>
						</div>
					</div>

					{filteredEvents.length > 0 ? (
						<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
							{filteredEvents.map(event => (
								<div
									key={event.id}
									className='bg-black border border-gray-700 rounded-lg overflow-hidden transition hover:bg-gray-900'>
									{/* image */}
									<div className='relative'>
										<img src={event.image} alt={event.title} className='w-full h-48 object-cover' />
										<div className='absolute top-3 right-3'>
											<span className='inline-block bg-black/70 backdrop-blur-sm text-purple-400 text-sm font-medium px-3 py-1 rounded-lg border border-gray-700'>
												{event.category}
											</span>
										</div>
									</div>
									{/* content */}
									<div className='p-4 text-gray-300'>
										<div className='flex justify-between items-start mb-2'>
											<h3 className='text-lg font-bold'>{event.title}</h3>
											<span className='text-sm'>{event.date}</span>
										</div>
										<div className='flex items-center mb-4 text-gray-400'>
											<svg className='h-5 w-5 mr-2' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={2}
													d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
												/>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={2}
													d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
												/>
											</svg>
											<span>{event.location}</span>
										</div>
										{/* progress */}
										<div className='mb-4'>
											<div className='flex justify-between text-sm mb-1'>
												<span className='text-gray-400'>Zapełnienie</span>
												<span className='text-purple-400'>
													{event.participants}/{event.slots}
												</span>
											</div>
											<div className='w-full bg-gray-700 rounded-full h-2'>
												<div
													className='h-2 rounded-full bg-gradient-to-r from-purple-600 to-purple-400'
													style={{ width: `${(event.participants / event.slots) * 100}%` }}
												/>
											</div>
										</div>
										{/* actions */}
										<div className='flex justify-between items-center'>
											<button className='text-gray-400 hover:text-white text-sm flex items-center space-x-1 transition'>
												<svg className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
													<path
														strokeLinecap='round'
														strokeLinejoin='round'
														strokeWidth={2}
														d='M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z'
													/>
												</svg>
												<span>Zapisz</span>
											</button>
											<button className='bg-gradient-to-r from-purple-600 to-purple-800 text-white py-2 px-5 rounded-lg hover:from-purple-700 hover:to-purple-900 transition cursor-pointer'>
												Dołącz
											</button>
										</div>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className='text-center py-16 bg-gray-800/50 rounded-xl border border-gray-700'>
							<div className='text-5xl mb-4 opacity-60'>🔍</div>
							<h3 className='text-xl font-medium text-white mb-3'>Nie znaleziono wydarzeń</h3>
							<p className='text-gray-400 mb-6'>Zmień kryteria wyszukiwania lub stwórz własne wydarzenie!</p>
							<button className='mt-4 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-medium py-3 px-8 rounded-lg hover:from-purple-700 hover:to-purple-900 transition cursor-pointer'>
								Stwórz własne wydarzenie
							</button>
						</div>
					)}

					{filteredEvents.length > 0 && (
						<div className='text-center mt-12'>
							<button className='bg-transparent border border-purple-600 text-purple-400 py-3 px-8 rounded-lg hover:bg-purple-900/20 transition'>
								Zobacz wszystkie wydarzenia
							</button>
						</div>
					)}
				</div>
			</section>

			{/* Features Section */}
			<section className='py-20 bg-black relative'>
				<div className='absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-gray-900 to-transparent'></div>
				<div className='absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,40,200,0.05),transparent_60%)]'></div>

				<div className='container mx-auto px-4 relative z-10'>
					<h2 className='text-3xl font-bold text-center text-white mb-4'>Dlaczego JoinMatch?</h2>
					<p className='text-gray-400 text-center max-w-2xl mx-auto mb-16'>
						Platforma która łączy pasjonatów sportu i umożliwia organizację wydarzeń na nowym poziomie
					</p>

					<div className='grid grid-cols-1 md:grid-cols-3 gap-12'>
						<div className='bg-gradient-to-b from-gray-800 to-gray-900 p-8 rounded-2xl border border-gray-700 shadow-lg hover:shadow-purple-900/10 transition-all hover:-translate-y-1 group'>
							<div className='bg-gradient-to-br from-purple-800 to-purple-600 rounded-xl w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-900/30 group-hover:shadow-purple-900/50 transition-all'>
								<svg className='h-8 w-8 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
									/>
								</svg>
							</div>
							<h3 className='text-xl font-bold text-center text-white mb-4 group-hover:text-purple-400 transition-colors'>
								Proste planowanie
							</h3>
							<p className='text-gray-400 text-center'>
								Zarządzaj swoim kalendarzem sportowym, otrzymuj powiadomienia o nadchodzących wydarzeniach i nigdy nie
								przegap okazji do gry.
							</p>
						</div>

						<div className='bg-gradient-to-b from-gray-800 to-gray-900 p-8 rounded-2xl border border-gray-700 shadow-lg hover:shadow-purple-900/10 transition-all hover:-translate-y-1 group'>
							<div className='bg-gradient-to-br from-purple-800 to-purple-600 rounded-xl w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-900/30 group-hover:shadow-purple-900/50 transition-all'>
								<svg className='h-8 w-8 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
									/>
								</svg>
							</div>
							<h3 className='text-xl font-bold text-center text-white mb-4 group-hover:text-purple-400 transition-colors'>
								Zarządzanie drużyną
							</h3>
							<p className='text-gray-400 text-center'>
								Twórz zespoły, zapraszaj znajomych i monitoruj postępy. Komunikacja i organizacja w jednym miejscu.
							</p>
						</div>

						<div className='bg-gradient-to-b from-gray-800 to-gray-900 p-8 rounded-2xl border border-gray-700 shadow-lg hover:shadow-purple-900/10 transition-all hover:-translate-y-1 group'>
							<div className='bg-gradient-to-br from-purple-800 to-purple-600 rounded-xl w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-900/30 group-hover:shadow-purple-900/50 transition-all'>
								<svg className='h-8 w-8 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
									/>
								</svg>
							</div>
							<h3 className='text-xl font-bold text-center text-white mb-4 group-hover:text-purple-400 transition-colors'>
								Rezerwacja obiektów
							</h3>
							<p className='text-gray-400 text-center'>
								Znajdź i zarezerwuj idealne miejsca na swoje wydarzenia sportowe, z aktualną dostępnością w czasie
								rzeczywistym.
							</p>
						</div>
					</div>

					<div className='mt-16 text-center'>
						<button className='bg-gradient-to-r from-purple-600 to-purple-800 text-white font-medium py-3 px-10 rounded-xl hover:from-purple-700 hover:to-purple-900 transition-all shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 cursor-pointer'>
							Poznaj wszystkie funkcje
						</button>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className='py-16 bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 relative overflow-hidden'>
				<div
					className='absolute inset-0 opacity-30'
					style={{
						backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath opacity='0.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
					}}></div>
				<div className='container mx-auto px-4 relative z-10'>
					<div className='max-w-3xl mx-auto text-center'>
						<h2 className='text-4xl font-bold text-white mb-6'>Gotowy do akcji?</h2>
						<p className='text-purple-200 text-xl mb-10'>
							Dołącz do tysięcy pasjonatów sportu, którzy każdego dnia odkrywają nowe wydarzenia, zawierają nowe
							znajomości i rozwijają swoje umiejętności.
						</p>
						<div className='flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 justify-center'>
							<button className='bg-white text-purple-900 font-bold py-4 px-10 rounded-xl hover:bg-gray-100 transition-colors shadow-xl hover:shadow-white/20 cursor-pointer'>
								Zarejestruj się za darmo
							</button>
							<button className='bg-transparent border-2 border-white text-white font-bold py-4 px-10 rounded-xl hover:bg-white/10 transition-colors'>
								Dowiedz się więcej
							</button>
						</div>
					</div>
				</div>
			</section>
		</div>
	)
}

export default MainPage
