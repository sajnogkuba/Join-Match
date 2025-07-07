import { useNavigate } from 'react-router-dom'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import axiosInstance from '../Api/axios'

const RegisterPage = () => {
	const navigate = useNavigate() // Dodano deklarację zmiennej navigate
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
		confirmPassword: '',
		dateOfBirth: '',
	})
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		})
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)
		setSuccess(null)

		// Prosta walidacja hasła
		if (formData.password !== formData.confirmPassword) {
			setError('Hasła nie są takie same!')
			return
		}

		setLoading(true)
		try {
			await axiosInstance.post('/auth/register', {
				name: formData.name,
				email: formData.email,
				password: formData.password,
				dateOfBirth: formData.dateOfBirth,
			})
			setSuccess('Rejestracja udana! Za chwilę nastąpi przekierowanie do logowania.')
			setTimeout(() => navigate('/login'), 2000)
		} catch (err: any) {
			if (err.response?.data) {
				setError('Rejestracja nieudana: ' + (err.response.data.message || 'Błąd serwera.'))
			} else {
				setError('Nie udało się połączyć z serwerem.')
			}
		}
		setLoading(false)
	}

	const handleGoogleRegister = () => {
		// Logika Google rejestracji
		console.log('Google register')
	}

	return (
		<div className='min-h-screen bg-gray-900 flex items-center justify-center p-4'>
			<div className='min-h-screen inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,40,200,0.1),transparent_60%)]'></div>
			<div className='relative z-10 w-full max-w-md'>
				<div className='bg-black/80 backdrop-blur-sm rounded-2xl border border-gray-700 p-8 shadow-2xl'>
				<div className='text-center mb-8'>
						<h1 className='text-3xl font-bold text-white mb-2'>Zarejestruj się</h1>
						<p className='text-gray-400'>Rozpocznij swoją sportową przygodę</p>
					</div>
					{error && <div className='mb-4 text-red-400 text-center'>{error}</div>}
					{success && <div className='mb-4 text-green-400 text-center'>{success}</div>}
					<form onSubmit={handleSubmit} className='space-y-6'>
						<div>
							<label className='block text-gray-300 text-sm font-medium mb-2'>Nazwa</label>
							<div className='relative'>
								<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
									{/* Ikona */}
									<svg className='h-5 w-5 text-gray-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
										/>
									</svg>
								</div>
								<input
									type='text'
									name='name'
									value={formData.name}
									onChange={handleChange}
									className='w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
									placeholder='Twoja nazwa'
									required
								/>
							</div>
						</div>
						<div>
							<label className='block text-gray-300 text-sm font-medium mb-2'>Email</label>
							<div className='relative'>
								<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
									{/* Ikona */}
									<svg className='h-5 w-5 text-gray-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207'
										/>
									</svg>
								</div>
								<input
									type='email'
									name='email'
									value={formData.email}
									onChange={handleChange}
									className='w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
									placeholder='twoj@email.com'
									required
								/>
							</div>
						</div>
						<div>
							<label className='block text-gray-300 text-sm font-medium mb-2'>Hasło</label>
							<div className='relative'>
								<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
									{/* Ikona hasło */}
									<svg className='h-5 w-5 text-gray-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
										/>
									</svg>
								</div>
								<input
									type={showPassword ? 'text' : 'password'}
									name='password'
									value={formData.password}
									onChange={handleChange}
									className='w-full pl-10 pr-12 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
									placeholder='Twoje hasło'
									required
								/>
								<button
									type='button'
									onClick={() => setShowPassword(!showPassword)}
									className='absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer'
									tabIndex={-1}>
									<svg
										className='h-5 w-5 text-gray-400 hover:text-gray-300'
										fill='none'
										viewBox='0 0 24 24'
										stroke='currentColor'>
										{showPassword ? (
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21'
											/>
										) : (
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
											/>
										)}
									</svg>
								</button>
							</div>
						</div>
						<div>
							<label className='block text-gray-300 text-sm font-medium mb-2'>Potwierdź hasło</label>
							<div className='relative'>
								<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
									{/* Ikona */}
									<svg className='h-5 w-5 text-gray-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
										/>
									</svg>
								</div>
								<input
									type={showConfirmPassword ? 'text' : 'password'}
									name='confirmPassword'
									value={formData.confirmPassword}
									onChange={handleChange}
									className='w-full pl-10 pr-12 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
									placeholder='Potwierdź hasło'
									required
								/>
								<button
									type='button'
									onClick={() => setShowConfirmPassword(!showConfirmPassword)}
									className='absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer'
									tabIndex={-1}>
									<svg
										className='h-5 w-5 text-gray-400 hover:text-gray-300'
										fill='none'
										viewBox='0 0 24 24'
										stroke='currentColor'>
										{showConfirmPassword ? (
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21'
											/>
										) : (
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
											/>
										)}
									</svg>
								</button>
							</div>
						</div>
						<div>
							<label className='block text-gray-300 text-sm font-medium mb-2'>Data urodzenia</label>
							<div className='relative'>
								<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
									{/* Ikona */}
									<svg className='h-5 w-5 text-gray-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
										/>
									</svg>
								</div>
								<input
									type='date'
									name='dateOfBirth'
									value={formData.dateOfBirth}
									onChange={handleChange}
									className='w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
									required
								/>
							</div>
						</div>
						<div className='flex items-start'>
							<input
								type='checkbox'
								id='terms'
								className='h-4 w-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 mt-1'
								required
							/>
							<label htmlFor='terms' className='ml-2 text-sm text-gray-300'>
								Akceptuję{' '}
								<button
									type='button'
									className='text-purple-400 hover:text-purple-300 transition-colors cursor-pointer'>
									regulamin
								</button>{' '}
								i{' '}
								<button
									type='button'
									className='text-purple-400 hover:text-purple-300 transition-colors cursor-pointer'>
									politykę prywatności
								</button>
							</label>
						</div>
						<button
							type='submit'
							disabled={loading}
							className='w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white font-medium py-3 px-4 rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all shadow-lg shadow-purple-900/30 cursor-pointer'>
							{loading ? 'Rejestracja...' : 'Zarejestruj się'}
						</button>
						<div className='relative'>
							<div className='absolute inset-0 flex items-center'>
								<div className='w-full border-t border-gray-600'></div>
							</div>
							<div className='relative flex justify-center text-sm'>
								<span className='px-2 bg-black text-gray-400'>lub</span>
							</div>
						</div>
						<button
							type='button'
							onClick={handleGoogleRegister}
							className='w-full bg-white text-gray-900 font-medium py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2 cursor-pointer'>
							{/* Google SVG */}
							<svg className='h-5 w-5' viewBox='0 0 24 24'>
								<path
									fill='currentColor'
									d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
								/>
								<path
									fill='currentColor'
									d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
								/>
								<path
									fill='currentColor'
									d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
								/>
								<path
									fill='currentColor'
									d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
								/>
							</svg>
							<span>Zarejestruj się z Google</span>
						</button>
					</form>
					<div className='mt-8 text-center'>
						<p className='text-gray-400'>
							Masz już konto?{' '}
							<Link to='/login' className='text-purple-400 hover:text-purple-300 font-medium transition-colors'>
								Zaloguj się
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default RegisterPage
