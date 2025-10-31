import React from 'react'
import { Users } from 'lucide-react'

const TeamsPage: React.FC = () => {
	return (
		<div className='min-h-screen bg-[#1f2632] text-zinc-300 pt-10'>
			<header className='relative h-[140px] w-full overflow-hidden'>
				<div
					className='absolute inset-0 bg-cover bg-center'
				/>
				<div className='absolute inset-0 bg-black/60' />
				<div className='relative z-10 mx-auto flex h-full max-w-7xl items-end justify-between px-4 pb-6 md:px-8'>
					<div>
						<h1 className='text-2xl md:text-3xl font-semibold text-white'>Drużyny</h1>
						<div className='mt-2 h-1 w-28 rounded-full bg-violet-600' />
					</div>
				</div>
			</header>

			<main className='mx-auto max-w-7xl px-4 py-8 md:px-8'>
				<div className='rounded-3xl bg-black/60 p-5 md:p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] ring-1 ring-zinc-800'>
					<div className='grid place-items-center rounded-2xl border border-zinc-800 bg-zinc-900/60 p-20 text-center'>
						<div>
							<Users className='mx-auto mb-4 text-5xl text-violet-400' size={64} />
							<h2 className='text-white text-xl font-semibold mb-2'>Drużyny</h2>
							<p className='text-zinc-400 text-sm'>
								Funkcjonalność drużyn będzie dostępna wkrótce.
							</p>
						</div>
					</div>
				</div>
			</main>
		</div>
	)
}

export default TeamsPage

