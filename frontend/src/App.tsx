// src/App.tsx
import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LoadScript } from '@react-google-maps/api'
import Layout from './components/Layout'
import MainPage from './pages/MainPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import { AuthProvider } from './Context/authContext'
import EventPage from './pages/EventPage'
import CreateEventPage from './pages/CreateEventPage.tsx'
import ProfilePage from './pages/ProfilePage.tsx'
import PrivateRoute from './routes/PrivateRoute.tsx'
import EventsPage from './pages/EventsPage.tsx'

const RankingsPage = () => <div className='container mx-auto px-4 py-20 mt-20'>Strona rankingów</div>
const AboutPage = () => <div className='container mx-auto px-4 py-20 mt-20'>O nas</div>
const ContactPage = () => <div className='container mx-auto px-4 py-20 mt-20'>Kontakt</div>
const FAQPage = () => <div className='container mx-auto px-4 py-20 mt-20'>FAQ</div>
const NotFoundPage = () => <div className='container mx-auto px-4 py-20 mt-20'>Strona nie znaleziona</div>

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY as string

const App: React.FC = () => (
	<AuthProvider>
		<LoadScript googleMapsApiKey={GOOGLE_MAPS_KEY}  libraries={['places']}>
			<BrowserRouter>
				<Routes>
					<Route path='/' element={<Layout />}>
						<Route index element={<MainPage />} />
						<Route path='events' element={<EventsPage />} />
						<Route path='event/:id' element={<EventPage />} />
						<Route path='rankingi' element={<RankingsPage />} />
						<Route path='o-nas' element={<AboutPage />} />
						<Route path='kontakt' element={<ContactPage />} />
						<Route path='faq' element={<FAQPage />} />
						<Route path='login' element={<LoginPage />} />
						<Route path='register' element={<RegisterPage />} />
						<Route path='stworz-wydarzenie' element={<CreateEventPage />} />
						<Route
							path='/profile'
							element={
								<PrivateRoute>
									<ProfilePage />
								</PrivateRoute>
							}
						/>
						<Route path='*' element={<NotFoundPage />} />
					</Route>
				</Routes>
			</BrowserRouter>
		</LoadScript>
	</AuthProvider>
)

export default App
