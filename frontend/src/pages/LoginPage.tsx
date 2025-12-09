import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../Context/authContext'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import axiosInstance from '../Api/axios';

const LoginPage = () => {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)
	const { login, loginWithGoogle } = useAuth()
	const navigate = useNavigate()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setError(null)
		try {
			await login(email, password)
			navigate('/')
		} catch (err: any) {
			if (err.response?.status === 403) {
				setError("Twoje konto zostało zablokowane");
			} else {
				setError("Nieprawidłowy email lub hasło");
			}
		}
		setLoading(false)
	}

	const handleGoogleSuccess = async (credentialResponse: any) => {
		try {
			const idToken = credentialResponse.credential;
	
			const res = await axiosInstance.post("/auth/google", {
				idToken,
			});
	
			const { email } = res.data;
	
			loginWithGoogle(email);
	
			navigate("/");
		} catch (err) {
			console.error("Google login error:", err);
		}
	};

	return (
		<div className='min-h-screen bg-gray-900 flex items-center justify-center p-4'>
			<div className='min-h-screen inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,40,200,0.1),transparent_60%)]'></div>
			<div className='relative z-10 w-full max-w-md'>
				<div className='bg-black/80 backdrop-blur-sm rounded-2xl border border-gray-700 p-8 shadow-2xl'>
					<div className='text-center mb-8'>
						<h1 className='text-3xl font-bold text-white mb-2'>Zaloguj się</h1>
						<p className='text-gray-400'>Wróć do swojej sportowej przygody</p>
					</div>
					{error && <div className='mb-4 text-red-400 text-center'>{error}</div>}
					<form onSubmit={handleSubmit} className='space-y-6'>
						<div>
							<label className='block text-gray-300 text-sm font-medium mb-2'>Email</label>
							<div className='relative'>
								<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
									{/* Ikona email */}
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
									value={email}
									onChange={e => setEmail(e.target.value)}
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
									value={password}
									onChange={e => setPassword(e.target.value)}
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
						<div className='flex items-center justify-between'>
							<div className='flex items-center'>
								<input
									type='checkbox'
									id='remember'
									className='h-4 w-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500'
								/>
								<label htmlFor='remember' className='ml-2 text-sm text-gray-300'>
									Zapamiętaj mnie
								</label>
							</div>
							<button
								type='button'
								className='text-sm text-purple-400 hover:text-purple-300 transition-colors cursor-pointer'>
								Zapomniałeś hasła?
							</button>
						</div>
						<button
							type='submit'
							disabled={loading}
							className='w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white font-medium py-3 px-4 rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all shadow-lg shadow-purple-900/30 cursor-pointer'>
							{loading ? 'Logowanie...' : 'Zaloguj się'}
						</button>

						<div className='relative'>
							<div className='absolute inset-0 flex items-center'>
								<div className='w-full border-t border-gray-600'></div>
							</div>
							<div className='relative flex justify-center text-sm'>
								<span className='px-2 bg-black text-gray-400'>lub</span>
							</div>
						</div>
						<div className='flex justify-center'>
							<div className='w-full'>
								<GoogleLogin
									onSuccess={handleGoogleSuccess}
									onError={() => console.log("Google login failed")}
									theme='outline'
									size='large'
									width='100%'
									text='signin_with'
									shape='rectangular'
									logo_alignment='left'
									useOneTap={false}
									containerProps={{
										style: {
											width: '100%',
											height: '48px'
										}
									}}
								/>
							</div>
						</div>
					</form>
					<div className='mt-8 text-center'>
						<p className='text-gray-400'>
							Nie masz konta?{' '}
							<Link to='/register' className='text-purple-400 hover:text-purple-300 font-medium transition-colors'>
								Zarejestruj się
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default LoginPage
