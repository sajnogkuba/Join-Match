import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, User, LogOut, LogIn, UserPlus } from 'lucide-react'
import Logo from '../assets/LogoWhite.png'
import { useAuth } from '../Context/authContext'

export const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const { isAuthenticated, logout, user } = useAuth()
  const location = useLocation()


  const navLinks = [
    { to: '/', label: 'Strona główna' },
    { to: '/events', label: 'Eventy' },
    { to: '/venues', label: 'Mecze' },
    { to: '/about', label: 'O nas' },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 bg-black/50 backdrop-blur-xl shadow-lg`}
    >
	<div className="container mx-auto px-4 relative">
	  <div className="flex justify-between items-center py-3 md:py-4">
		{/* Logo */}
		<Link to="/" className="flex items-center gap-2">
		<motion.img
		  src={Logo}
		  alt="JoinMatch Logo"
		  className="h-8 md:h-9"
		  whileHover={{ scale: 1.05 }}
		  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
		/>
		</Link>

		{/* Desktop Nav */}
		<div className="hidden md:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
		{navLinks.map(link => (
		  <Link
			key={link.to}
			to={link.to}
			className={`font-medium transition-colors ${
			location.pathname === link.to
			  ? 'text-violet-400'
			  : 'text-zinc-300 hover:text-white'
			}`}
		  >
			{link.label}
		  </Link>
		))}
		</div>

		{/* Right side */}
		<div className="hidden md:flex items-center space-x-4">
		{!isAuthenticated ? (
		  <>
			<Link
			to="/login"
			className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-200 hover:text-white transition"
			>
			<LogIn size={16} /> Zaloguj
			</Link>
			<Link
			to="/register"
			className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-violet-800 px-4 py-2 rounded-lg text-sm font-semibold text-white hover:from-violet-700 hover:to-violet-900 shadow-md transition"
			>
			<UserPlus size={16} /> Zarejestruj
			</Link>
		  </>
		) : (
		  <div className="relative">
			<button
			onClick={() => setShowProfileMenu(!showProfileMenu)}
			className="relative flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-violet-800 text-white font-semibold shadow-lg hover:text-white focus:outline-none"
			>
			<User size={18} />
			</button>
			<AnimatePresence>
			{showProfileMenu && (
			  <motion.div
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -10 }}
				transition={{ duration: 0.15 }}
				className="absolute right-0 mt-3 min-w-48 max-w-80 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-xl shadow-xl overflow-hidden z-50"
			  >
				<div className="px-4 py-3 border-b border-zinc-800 text-sm text-zinc-400">
				<span className="block text-white font-semibold break-words">{user}</span>
				<span className="text-xs text-zinc-500">Użytkownik</span>
				</div>
				<Link
				to="/profile"
				onClick={() => setShowProfileMenu(false)}
				className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-800 text-sm text-zinc-300"
				>
				<User size={16} /> Profil
				</Link>
				<button
				onClick={() => {
				  logout()
				  setShowProfileMenu(false)
				}}
				className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-600/20 text-sm text-red-400"
				>
				<LogOut size={16} /> Wyloguj
				</button>
			  </motion.div>
			)}
			</AnimatePresence>
		  </div>
		)}
		</div>

		{/* Mobile Menu Button */}
		<div className="md:hidden">
		<button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-lg text-white">
		  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
		</button>
		</div>
	  </div>
	</div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-black/95 backdrop-blur-xl border-t border-zinc-800 shadow-lg"
          >
            <div className="flex flex-col px-4 py-4 space-y-3">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg text-zinc-300 hover:bg-zinc-800 ${
                    location.pathname === link.to && 'text-violet-400'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-zinc-800 my-2" />
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-zinc-300 hover:bg-zinc-800 rounded-lg"
                  >
                    <LogIn size={16} /> Zaloguj
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-violet-800 px-3 py-2 rounded-lg text-white justify-center"
                  >
                    <UserPlus size={16} /> Zarejestruj
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-zinc-300 hover:bg-zinc-800 rounded-lg"
                  >
                    <User size={16} /> Profil
                  </Link>
                  <button
                    onClick={() => {
                      logout()
                      setIsMenuOpen(false)
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-600/20 rounded-lg"
                  >
                    <LogOut size={16} /> Wyloguj
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar
