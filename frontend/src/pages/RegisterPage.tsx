import { useNavigate } from 'react-router-dom'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import axiosInstance from '../Api/axios'
import DatePicker from '../components/DatePicker'
import { useAuth } from '../Context/authContext'
import dayjs from 'dayjs'

const RegisterPage = () => {
	const navigate = useNavigate()
	const { loginWithGoogle, verifyAccount } = useAuth()

	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
		confirmPassword: '',
		dateOfBirth: '',
		termsAccepted: false,
	})

	const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({})

	const [isVerificationStep, setIsVerificationStep] = useState(false)
	const [verificationCode, setVerificationCode] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)

	const [apiError, setApiError] = useState<string | null>(null)
	const [success, setSuccess] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)

	// --- WALIDACJA ---
	const validateField = (name: string, value: any) => {
		let error = ''
		switch (name) {
			case 'name':
				if (value.length < 3) error = 'Imię musi mieć min. 3 znaki'
				break
			case 'email':
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
				if (!emailRegex.test(value)) error = 'Nieprawidłowy format email'
				break
			case 'password':
				if (value.length < 8) error = 'Hasło musi mieć min. 8 znaków'
				break
			case 'confirmPassword':
				if (value !== formData.password) error = 'Hasła nie są identyczne'
				break
			case 'dateOfBirth':
				if (!value) error = 'Data jest wymagana'
				else {
					const age = dayjs().diff(dayjs(value), 'year')
					if (age < 13) error = 'Musisz mieć co najmniej 13 lat'
				}
				break
			case 'termsAccepted':
				if (!value) error = 'Musisz zaakceptować regulamin'
				break
		}
		setFieldErrors(prev => ({ ...prev, [name]: error }))
	}

	const getPasswordStrength = () => {
		const pass = formData.password
		if (!pass) return 0
		let score = 0
		if (pass.length >= 8) score += 1
		if (/[A-Z]/.test(pass)) score += 1
		if (/[0-9]/.test(pass)) score += 1
		if (/[^A-Za-z0-9]/.test(pass)) score += 1
		return score // 0-4
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value, type, checked } = e.target
		const val = type === 'checkbox' ? checked : value

		setFormData({ ...formData, [name]: val })

		validateField(name, val)
		if (name === 'password') validateField('confirmPassword', formData.confirmPassword)
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setApiError(null)
		setSuccess(null)

		const hasErrors = Object.values(fieldErrors).some(err => err !== '')
		const hasEmptyFields =
			!formData.name || !formData.email || !formData.password || !formData.dateOfBirth || !formData.termsAccepted

		if (hasErrors || hasEmptyFields) {
			setApiError('Popraw błędy w formularzu i uzupełnij wszystkie pola.')
			Object.keys(formData).forEach(key => validateField(key, (formData as any)[key]))
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

			setSuccess('Konto utworzone. Sprawdź e-mail i wpisz kod weryfikacyjny.')
			setIsVerificationStep(true)
		} catch (err: any) {
			if (err.response?.status === 409) {
				setApiError('Taki użytkownik już istnieje. Zaloguj się.')
			} else if (err.response?.data?.message) {
				setApiError('Błąd: ' + err.response.data.message)
			} else {
				setApiError('Nie udało się połączyć z serwerem.')
			}
		} finally {
			setLoading(false)
		}
	}

	const handleVerifySubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setApiError(null)
		setLoading(true)

		try {
			await verifyAccount(formData.email, verificationCode)
			setSuccess('Konto zweryfikowane pomyślnie! Przekierowanie...')
			setTimeout(() => navigate('/login'), 2000)
		} catch (err: any) {
			setApiError('Nieprawidłowy kod weryfikacyjny.')
		} finally {
			setLoading(false)
		}
	}

	const handleGoogleSuccess = async (credentialResponse: any) => {
		try {
			const idToken = credentialResponse.credential
			const res = await axiosInstance.post('/auth/google', { idToken })
			const { email } = res.data
			loginWithGoogle(email)
			navigate('/')
		} catch (err) {
			setApiError('Nie udało się zarejestrować przez Google')
		}
	}

	const passwordScore = getPasswordStrength()
	const strengthColor = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']

	return (
		<div className='min-h-screen pt-24 bg-gray-900 flex items-center justify-center p-4'>
			<div className='fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,40,200,0.1),transparent_60%)] pointer-events-none'></div>
			<div className='relative z-10 w-full max-w-md'>
				<div className='bg-gradient-to-b from-zinc-900/80 to-black/80 backdrop-blur-sm rounded-2xl border border-white/10 p-8 shadow-[0_0_60px_-15px_rgba(168,85,247,0.35)]'>
					<div className='text-center mb-8'>
						<h1 className='text-3xl font-bold text-white mb-2'>
							{isVerificationStep ? 'Weryfikacja' : 'Zarejestruj się'}
						</h1>
						<p className='text-gray-400'>
							{isVerificationStep ? `Wpisz kod wysłany na ${formData.email}` : 'Rozpocznij swoją sportową przygodę'}
						</p>
					</div>

					{apiError && (
						<div className='mb-4 p-3 bg-red-900/50 border border-red-700 text-red-200 rounded-lg text-sm text-center'>
							{apiError}
						</div>
					)}
					{success && (
						<div className='mb-4 p-3 bg-green-900/50 border border-green-700 text-green-200 rounded-lg text-sm text-center'>
							{success}
						</div>
					)}

					{!isVerificationStep ? (
						<form onSubmit={handleSubmit} className='space-y-5'>
							{/* IMIE */}
							<div>
								<label className='block text-gray-300 text-xs font-medium mb-1 uppercase tracking-wider'>Nazwa</label>
								<div className='relative'>
									<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400'>
										<svg className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
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
										className={`w-full pl-10 pr-4 py-3 bg-zinc-900/70 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-purple-500/40 transition-colors ${
											fieldErrors.name ? 'border-red-500' : ''
										}`}
										placeholder='Twoja nazwa'
									/>
								</div>
								{fieldErrors.name && <p className='text-red-400 text-xs mt-1'>{fieldErrors.name}</p>}
							</div>

							{/* EMAIL */}
							<div>
								<label className='block text-gray-300 text-xs font-medium mb-1 uppercase tracking-wider'>Email</label>
								<div className='relative'>
									<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400'>
										<svg className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
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
										className={`w-full pl-10 pr-4 py-3 bg-zinc-900/70 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-purple-500/40 transition-colors ${
											fieldErrors.email ? 'border-red-500' : ''
										}`}
										placeholder='twoj@email.com'
									/>
								</div>
								{fieldErrors.email && <p className='text-red-400 text-xs mt-1'>{fieldErrors.email}</p>}
							</div>

							{/* HASŁO */}
							<div>
								<label className='block text-gray-300 text-xs font-medium mb-1 uppercase tracking-wider'>Hasło</label>
								<div className='relative'>
									<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400'>
										<svg className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
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
										className={`w-full pl-10 pr-12 py-3 bg-zinc-900/70 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-purple-500/40 transition-colors ${
											fieldErrors.password ? 'border-red-500' : ''
										}`}
										placeholder='Min. 8 znaków'
									/>
									<button
										type='button'
										onClick={() => setShowPassword(!showPassword)}
										className='absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-white'>
										{showPassword ? (
											<svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth='2'
													d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21'></path>
											</svg>
										) : (
											<svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth='2'
													d='M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'></path>
											</svg>
										)}
									</button>
								</div>
								{/* Pasek siły hasła */}
								{formData.password.length > 0 && (
									<div className='h-1 w-full bg-gray-700 rounded-full mt-2 overflow-hidden'>
										<div
											className={`h-full transition-all duration-300 ${strengthColor[passwordScore]}`}
											style={{ width: `${(passwordScore / 4) * 100}%` }}></div>
									</div>
								)}
								{fieldErrors.password && <p className='text-red-400 text-xs mt-1'>{fieldErrors.password}</p>}
							</div>

							{/* POTWIERDŹ HASŁO */}
							<div>
								<label className='block text-gray-300 text-xs font-medium mb-1 uppercase tracking-wider'>
									Potwierdź hasło
								</label>
								<div className='relative'>
									<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400'>
										<svg className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
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
										className={`w-full pl-10 pr-12 py-3 bg-zinc-900/70 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-purple-500/40 transition-colors ${
											fieldErrors.confirmPassword ? 'border-red-500' : ''
										}`}
										placeholder='Powtórz hasło'
									/>
									<button
										type='button'
										onClick={() => setShowConfirmPassword(!showConfirmPassword)}
										className='absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-white'>
										{showConfirmPassword ? (
											<svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth='2'
													d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21'></path>
											</svg>
										) : (
											<svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth='2'
													d='M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'></path>
											</svg>
										)}
									</button>
								</div>
								{fieldErrors.confirmPassword && (
									<p className='text-red-400 text-xs mt-1'>{fieldErrors.confirmPassword}</p>
								)}
							</div>

							{/* DATA URODZENIA (Poprawione nachodzenie) */}
							<div>
								<label className='block text-gray-300 text-xs font-medium mb-1 uppercase tracking-wider'>
									Data urodzenia
								</label>
								<div className='relative'>
									{/* Dodałem z-10 żeby ikona była zawsze na wierzchu */}
									<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10 text-gray-400'>
										<svg className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
											/>
										</svg>
									</div>
									<div
										className={`rounded-lg border ${fieldErrors.dateOfBirth ? 'border-red-500' : 'border-white/10'}`}>
										<div className='relative'>
											<DatePicker
												value={formData.dateOfBirth}
												onChange={date => {
													setFormData({ ...formData, dateOfBirth: date })
													validateField('dateOfBirth', date)
												}}
												placeholder='Wybierz datę'
												mode='birth'
												theme='purple'
												withLeftIcon
											/>
										</div>
									</div>
								</div>
								{fieldErrors.dateOfBirth && <p className='text-red-400 text-xs mt-1'>{fieldErrors.dateOfBirth}</p>}
							</div>

							{/* CHECKBOX REGULAMIN */}
							<div className='flex items-start'>
								<div className='flex items-center h-5'>
									<input
										type='checkbox'
										id='terms'
										name='termsAccepted'
										checked={formData.termsAccepted}
										onChange={handleChange}
										className='w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 focus:ring-2'
									/>
								</div>
								<label htmlFor='terms' className='ml-2 text-sm text-gray-400'>
									Akceptuję{' '}
									<button type='button' className='text-purple-400 hover:text-purple-300 transition-colors'>
										regulamin
									</button>{' '}
									i{' '}
									<button type='button' className='text-purple-400 hover:text-purple-300 transition-colors'>
										politykę prywatności
									</button>
								</label>
							</div>
							{fieldErrors.termsAccepted && <p className='text-red-400 text-xs -mt-3'>{fieldErrors.termsAccepted}</p>}

							<button
								type='submit'
								disabled={loading}
								className='w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white font-medium py-3 px-4 rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all shadow-lg shadow-purple-900/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01] active:scale-[0.99] duration-200'>
								{loading ? 'Przetwarzanie...' : 'Utwórz konto'}
							</button>

							{/* GOOGLE I LINKI */}
							<div className='relative my-6'>
								<div className='absolute inset-0 flex items-center'>
									<div className='w-full border-t border-gray-600'></div>
								</div>
								<div className='relative flex justify-center text-sm'>
									<span className='px-2 bg-black/80 text-gray-400'>lub kontynuuj przez</span>
								</div>
							</div>

							<div className='flex justify-center'>
								<div className='w-full max-w-80'>
									<GoogleLogin
										onSuccess={handleGoogleSuccess}
										onError={() => setApiError('Błąd Google Auth')}
										theme='filled_black'
										shape='pill'
										size='large'
										text='signup_with'
									/>
								</div>
							</div>
						</form>
					) : (
						// FORMULARZ WERYFIKACJI (Bez większych zmian, tylko stylowanie spójne)
						<form onSubmit={handleVerifySubmit} className='space-y-6'>
							<div>
								<label className='block text-gray-300 text-xs font-medium mb-1 uppercase tracking-wider'>
									Kod weryfikacyjny
								</label>
								<div className='relative'>
									<input
										type='text'
										value={verificationCode}
										onChange={e => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
										className='w-full py-4 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 text-center tracking-[0.5em] text-2xl font-bold'
										placeholder='000000'
										maxLength={6}
										required
									/>
								</div>
							</div>
							<button
								type='submit'
								disabled={loading}
								className='w-full bg-linear-to-r from-purple-600 to-purple-800 text-white font-medium py-3 px-4 rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all shadow-lg shadow-purple-900/30'>
								{loading ? 'Sprawdzanie...' : 'Zweryfikuj konto'}
							</button>
							<div className='text-center'>
								<button
									type='button'
									onClick={() => setIsVerificationStep(false)}
									className='text-gray-400 hover:text-white text-sm underline'>
									To nie twój email? Wróć
								</button>
							</div>
						</form>
					)}

					<div className='mt-8 text-center pt-4 border-t border-gray-700'>
						<p className='text-gray-400 text-sm'>
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
