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
import AboutUsPage from './pages/AboutUsPage.tsx'
import ContactPage from './pages/ContactPage.tsx'
import FAQPage from './pages/FAQPage.tsx'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage.tsx'
import TermsOfServicePage from './pages/TermsOfServicePage.tsx'
import UserProfilePage from './pages/UserProfilePage.tsx'

const RankingsPage = () => <div className='container mx-auto px-4 py-20 mt-20'>Strona rankingów</div>
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
						<Route path='about' element={<AboutUsPage />} />
						<Route path='kontakt' element={<ContactPage />} />
						<Route path='faq' element={<FAQPage />} />
						<Route path='privacy' element={<PrivacyPolicyPage />} />
						<Route path='terms' element={<TermsOfServicePage />} />
						<Route path='login' element={<LoginPage />} />
						<Route path='register' element={<RegisterPage />} />
						<Route path='stworz-wydarzenie' element={<CreateEventPage />} />
						<Route path="profile/:id" element={<UserProfilePage />} />
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
