import { useState } from 'react'
import { motion } from 'framer-motion'

const inputBase =
	'w-full px-4 py-3 rounded-xl bg-zinc-900/70 border border-zinc-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-600 focus:border-transparent transition'
const card = 'bg-black/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-5 shadow-[0_0_20px_rgba(0,0,0,0.3)]'

export default function CreateTeamForm() {
	const [teamName, setTeamName] = useState('')
	const [error, setError] = useState<string | null>(null)

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (!teamName.trim() || teamName.trim().length < 3) {
			setError('Podaj nazwę drużyny (min. 3 znaki).')
			return
		}
		setError(null)
		// TODO: Wysyłanie do API
		console.log('Tworzenie drużyny:', teamName)
	}

	return (
		<div className='bg-[#0d0d10] text-white min-h-screen py-20 px-4'>
			<motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className='max-w-5xl mx-auto'>
				<h1 className='text-4xl font-bold mb-8 text-center'>
					<span className='text-violet-400'>Stwórz</span> nową drużynę
				</h1>

				<form onSubmit={handleSubmit} className='max-w-2xl mx-auto'>
					<div className={card}>
						<label className='block text-zinc-400 mb-2'>Nazwa drużyny</label>
						<input
							type='text'
							className={`${inputBase} ${error ? 'border-red-500' : ''}`}
							placeholder='np. Mistrzowie Piłki'
							value={teamName}
							onChange={e => {
								setTeamName(e.target.value)
								setError(null)
							}}
						/>
						{error && <p className='text-red-400 text-sm mt-1'>{error}</p>}
					</div>

					<div className='mt-10 text-center'>
						<button
							type='submit'
							className='bg-gradient-to-r from-violet-600 to-violet-800 hover:from-violet-700 hover:to-violet-500 px-10 py-4 rounded-xl font-semibold text-white shadow-lg shadow-violet-900/30 transition-all hover:-translate-y-0.5'>
							Stwórz Drużynę
						</button>
					</div>
				</form>
			</motion.div>
		</div>
	)
}

