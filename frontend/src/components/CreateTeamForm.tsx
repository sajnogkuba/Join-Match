import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../Api/axios'
import type { User } from '../Api/types/User.ts'
import { Upload, MapPin } from 'lucide-react'
import SportTypeFilter from './SportTypeFilter'

const inputBase =
	'w-full px-4 py-3 rounded-xl bg-zinc-900/70 border border-zinc-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-600 focus:border-transparent transition'
const card = 'bg-black/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-5 shadow-[0_0_20px_rgba(0,0,0,0.3)]'

type FormErrors = {
	name?: string
	city?: string
	sportTypeId?: string
	description?: string
}

export default function CreateTeamForm() {
	const [name, setName] = useState('')
	const [city, setCity] = useState('')
	const [sportTypeId, setSportTypeId] = useState<number | null>(null)
	const [description, setDescription] = useState('')
	const [selectedFile, setSelectedFile] = useState<File | null>(null)

	const [leaderId, setLeaderId] = useState<number | null>(null)
	const [errors, setErrors] = useState<FormErrors>({})
	const [submitting, setSubmitting] = useState(false)
	const [serverError, setServerError] = useState<string | null>(null)
	const [serverOk, setServerOk] = useState<string | null>(null)
	const [uploadingImage, setUploadingImage] = useState(false)

	useEffect(() => {
		const token = localStorage.getItem('accessToken')
		if (!token) {
			setServerError('Brak tokenu autoryzacyjnego.')
			return
		}

		// Pobierz leaderId
		api.get<User>('/auth/user', { params: { token } })
			.then(({ data }) => setLeaderId(data.id))
			.catch(() => setServerError('Nie udało się pobrać danych użytkownika.'))
	}, [])

	const validate = (): boolean => {
		const newErrors: FormErrors = {}
		if (!name.trim() || name.trim().length < 2) {
			newErrors.name = 'Podaj nazwę drużyny (min. 2 znaki).'
		} else if (name.trim().length > 100) {
			newErrors.name = 'Nazwa drużyny nie może przekraczać 100 znaków.'
		}
		if (!city.trim() || city.trim().length < 2) {
			newErrors.city = 'Podaj miasto (min. 2 znaki).'
		} else if (city.trim().length > 100) {
			newErrors.city = 'Nazwa miasta nie może przekraczać 100 znaków.'
		}
		if (!sportTypeId) {
			newErrors.sportTypeId = 'Wybierz sport.'
		}
		if (description.trim().length > 500) {
			newErrors.description = 'Opis nie może przekraczać 500 znaków.'
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!validate()) return
		if (!leaderId) {
			setServerError('Brak zalogowanego użytkownika.')
			return
		}

		try {
			setSubmitting(true)
			let photoUrl = null
			if (selectedFile) {
				setUploadingImage(true)
				const formData = new FormData()
				formData.append('file', selectedFile)
				const res = await api.post('images/upload/team', formData, {
					headers: { 'Content-Type': 'multipart/form-data' },
				})
				photoUrl = res.data
			}

			await api.post('/team', {
				name: name.trim(),
				city: city.trim(),
				sportTypeId,
				description: description.trim() || null,
				leaderId,
				photoUrl,
			})

			setServerOk('🎉 Drużyna utworzona pomyślnie!')
			setName('')
			setCity('')
			setSportTypeId(null)
			setDescription('')
			setSelectedFile(null)
		} catch (err: any) {
			console.error('Błąd tworzenia drużyny:', err)
			
			// Obsługa błędu duplikacji nazwy drużyny
			const errorMessage = err.response?.data?.message || err.response?.data || err.message || ''
			
			if (errorMessage.includes('Team with this name already exists') || 
			    errorMessage.includes('already exists')) {
				setServerError('Drużyna o tej nazwie już istnieje. Wybierz inną nazwę.')
				// Wyświetl błąd również przy polu nazwa
				setErrors(prev => ({ ...prev, name: 'Drużyna o tej nazwie już istnieje.' }))
			} else {
				setServerError(errorMessage || 'Nie udało się utworzyć drużyny.')
			}
		} finally {
			setSubmitting(false)
			setUploadingImage(false)
		}
	}

	return (
		<div className='bg-[#0d0d10] text-white min-h-screen py-20 px-4'>
			<motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className='max-w-5xl mx-auto'>
				<h1 className='text-4xl font-bold mb-8 text-center'>
					<span className='text-violet-400'>Stwórz</span> nową drużynę
				</h1>

				{(serverError || serverOk) && (
					<div
						className={`mb-6 text-center px-4 py-3 rounded-xl ${
							serverError
								? 'bg-red-900/40 border border-red-700 text-red-300'
								: 'bg-green-900/40 border border-green-700 text-green-300'
						}`}>
						{serverError || serverOk}
					</div>
				)}

				<form onSubmit={handleSubmit} className='grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto'>
					{/* Nazwa */}
					<div className={card}>
						<label className='block text-zinc-400 mb-2'>Nazwa drużyny</label>
						<input
							type='text'
							className={`${inputBase} ${errors.name ? 'border-red-500' : ''}`}
							placeholder='np. Mistrzowie Piłki'
							value={name}
							onChange={e => {
								setName(e.target.value)
								setErrors(prev => ({ ...prev, name: undefined }))
							}}
							maxLength={100}
						/>
						{errors.name && <p className='text-red-400 text-sm mt-1'>{errors.name}</p>}
					</div>

					{/* Miasto */}
					<div className={card}>
						<label className='block text-zinc-400 mb-2 flex items-center gap-2'>
							<MapPin size={16} /> Miasto
						</label>
						<input
							type='text'
							className={`${inputBase} ${errors.city ? 'border-red-500' : ''}`}
							placeholder='np. Warszawa'
							value={city}
							onChange={e => {
								setCity(e.target.value)
								setErrors(prev => ({ ...prev, city: undefined }))
							}}
							maxLength={100}
						/>
						{errors.city && <p className='text-red-400 text-sm mt-1'>{errors.city}</p>}
					</div>

					{/* Sport */}
					<div className={card}>
						<label className='block text-zinc-400 mb-2'>Rodzaj sportu</label>
						<div className={errors.sportTypeId ? 'border border-red-500 rounded-xl' : ''}>
							<SportTypeFilter
								value={sportTypeId}
								onChange={(id) => {
									setSportTypeId(id)
									setErrors(prev => ({ ...prev, sportTypeId: undefined }))
								}}
							/>
						</div>
						{errors.sportTypeId && <p className='text-red-400 text-sm mt-1'>{errors.sportTypeId}</p>}
					</div>

					{/* Opis */}
					<div className={`${card} md:col-span-2 lg:col-span-3`}>
						<label className='block text-zinc-400 mb-2'>Opis (opcjonalne)</label>
						<textarea
							className={`${inputBase} min-h-[100px] resize-y ${errors.description ? 'border-red-500' : ''}`}
							placeholder='Opisz swoją drużynę...'
							value={description}
							onChange={e => {
								setDescription(e.target.value)
								setErrors(prev => ({ ...prev, description: undefined }))
							}}
							maxLength={500}
						/>
						{errors.description && <p className='text-red-400 text-sm mt-1'>{errors.description}</p>}
						<p className='text-zinc-500 text-xs mt-1'>
							{description.length}/500 znaków
						</p>
					</div>

					{/* Zdjęcie */}
					<div className={`${card} md:col-span-2 lg:col-span-3`}>
						<label className='block text-zinc-400 mb-2 flex items-center gap-2'>
							<Upload size={16} /> Zdjęcie drużyny (opcjonalne)
						</label>
						<input
							type='file'
							accept='image/*'
							onChange={e => setSelectedFile(e.target.files?.[0] || null)}
							className='file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-semibold file:bg-violet-700 file:text-white hover:file:bg-violet-800 cursor-pointer bg-zinc-900/70 text-gray-300 border border-zinc-700 rounded-xl p-2 w-full'
						/>
						{selectedFile && (
							<p className='text-sm text-zinc-400 mt-2'>
								{selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
							</p>
						)}
					</div>
				</form>

				<div className='mt-10 text-center'>
					<button
						type='submit'
						onClick={handleSubmit}
						disabled={submitting}
						className='bg-gradient-to-r from-violet-600 to-violet-800 hover:from-violet-700 hover:to-violet-500 px-10 py-4 rounded-xl font-semibold text-white shadow-lg shadow-violet-900/30 transition-all hover:-translate-y-0.5 disabled:opacity-60'>
						{uploadingImage ? 'Przesyłanie zdjęcia...' : submitting ? 'Tworzenie...' : 'Stwórz Drużynę'}
					</button>
				</div>
			</motion.div>
		</div>
	)
}

