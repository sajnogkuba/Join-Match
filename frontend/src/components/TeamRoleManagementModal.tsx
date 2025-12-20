import React, { useState, useEffect } from 'react'
import { X, Loader2, Plus, Edit2, Trash2, Settings, AlertTriangle, Check, Users } from 'lucide-react'
import api from '../Api/axios'
import type { TeamRole } from '../Api/types/TeamRole'
import type { TeamMember } from '../Api/types/TeamMember'
import AlertModal from './AlertModal'
import { parseLocalDate } from '../utils/formatDate'
import Avatar from './Avatar'
import TeamRoleColorPicker from './TeamRoleColorPicker'

interface TeamRoleManagementModalProps {
	isOpen: boolean
	onClose: () => void
	teamId: number
	leaderId: number
	onMembersUpdate?: () => void
}

const TeamRoleManagementModal: React.FC<TeamRoleManagementModalProps> = ({ isOpen, onClose, teamId, leaderId, onMembersUpdate }) => {
	const [roles, setRoles] = useState<TeamRole[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState<string | null>(null)
	
	// Członkowie drużyny
	const [members, setMembers] = useState<TeamMember[]>([])
	const [membersLoading, setMembersLoading] = useState(false)
	const [assigningRole, setAssigningRole] = useState<number | null>(null)
	
	// Formularz tworzenia roli
	const [newRoleName, setNewRoleName] = useState('')
	const [newRoleColor, setNewRoleColor] = useState<string | null>(null)
	const [showColorPicker, setShowColorPicker] = useState(false)
	const [creating, setCreating] = useState(false)
	
	// Edycja roli
	const [editingRoleId, setEditingRoleId] = useState<number | null>(null)
	const [editingRoleName, setEditingRoleName] = useState('')
	const [editingRoleColor, setEditingRoleColor] = useState<string | null>(null)
	const [showEditColorPicker, setShowEditColorPicker] = useState(false)
	const [updating, setUpdating] = useState(false)
	
	// Usuwanie roli
	const [deletingRoleId, setDeletingRoleId] = useState<number | null>(null)
	const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false)
	const [roleToDelete, setRoleToDelete] = useState<TeamRole | null>(null)

	// Pobierz role i członków przy otwarciu modala
	useEffect(() => {
		if (isOpen && teamId) {
			fetchRoles()
			fetchMembers()
		}
	}, [isOpen, teamId])

	// Obsługa ESC
	useEffect(() => {
		if (!isOpen) return
		
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				handleClose()
			}
		}
		
		document.addEventListener('keydown', handleEscape)
		return () => document.removeEventListener('keydown', handleEscape)
	}, [isOpen])

	const fetchRoles = async () => {
		setLoading(true)
		setError(null)
		try {
			const { data } = await api.get<TeamRole[]>(`/team-role/${teamId}`)
			setRoles(data || [])
		} catch (err: any) {
			console.error('Błąd pobierania ról:', err)
			setError('Nie udało się pobrać ról drużyny')
		} finally {
			setLoading(false)
		}
	}

	const fetchMembers = async () => {
		setMembersLoading(true)
		try {
			type TeamMembersPageResponse = {
				content: TeamMember[]
				totalElements: number
			}
			const { data } = await api.get<TeamMembersPageResponse>(`/user-team/${teamId}/members`, {
				params: { page: 0, size: 100, sort: 'userName', direction: 'ASC' },
			})
			// Filtruj członków - wyklucz lidera
			const filteredMembers = (data.content || []).filter(member => member.userId !== leaderId)
			setMembers(filteredMembers)
		} catch (err: any) {
			console.error('Błąd pobierania członków:', err)
			setMembers([])
		} finally {
			setMembersLoading(false)
		}
	}

	const handleClose = () => {
		setNewRoleName('')
		setNewRoleColor(null)
		setShowColorPicker(false)
		setEditingRoleId(null)
		setEditingRoleName('')
		setEditingRoleColor(null)
		setShowEditColorPicker(false)
		setError(null)
		setSuccess(null)
		setDeletingRoleId(null)
		setShowDeleteConfirmModal(false)
		setRoleToDelete(null)
		setMembers([])
		onClose()
		// Odśwież listę członków w rodzicu po zamknięciu modala
		if (onMembersUpdate) {
			onMembersUpdate()
		}
	}

	const handleAssignRole = async (userId: number, roleId: number | null) => {
		setAssigningRole(userId)
		setError(null)
		setSuccess(null)
		
		try {
			await api.put(`/user-team/${teamId}/members/${userId}/role`, {
				roleId: roleId,
			})
			
			setSuccess('Rola została przypisana')
			await fetchMembers()
			await fetchRoles()
			
			setTimeout(() => setSuccess(null), 2000)
		} catch (err: any) {
			console.error('Błąd przypisywania roli:', err)
			const errorMsg = err?.response?.data?.message || err?.response?.data || 'Nie udało się przypisać roli'
			setError(errorMsg)
		} finally {
			setAssigningRole(null)
		}
	}

	const handleCreateRole = async (e: React.FormEvent) => {
		e.preventDefault()
		const trimmed = newRoleName.trim()
		
		if (!trimmed) {
			setError('Nazwa roli nie może być pusta')
			return
		}
		
		if (trimmed.length > 100) {
			setError('Nazwa roli nie może przekraczać 100 znaków')
			return
		}
		
		setCreating(true)
		setError(null)
		setSuccess(null)
		
		try {
			await api.post('/team-role', {
				name: trimmed,
				teamId: teamId,
				color: newRoleColor,
			})
			
			setNewRoleName('')
			setNewRoleColor(null)
			setShowColorPicker(false)
			setSuccess('Rola została utworzona')
			await fetchRoles()
			await fetchMembers()
			
			setTimeout(() => setSuccess(null), 2000)
		} catch (err: any) {
			console.error('Błąd tworzenia roli:', err)
			const errorMsg = err?.response?.data?.message || err?.response?.data || 'Nie udało się utworzyć roli'
			setError(errorMsg)
		} finally {
			setCreating(false)
		}
	}

	const handleStartEdit = (role: TeamRole) => {
		setEditingRoleId(role.id)
		setEditingRoleName(role.name)
		setEditingRoleColor(role.color || null)
		setShowEditColorPicker(false)
		setError(null)
		setSuccess(null)
	}

	const handleCancelEdit = () => {
		setEditingRoleId(null)
		setEditingRoleName('')
		setEditingRoleColor(null)
		setShowEditColorPicker(false)
	}

	const handleUpdateRole = async (roleId: number) => {
		const trimmed = editingRoleName.trim()
		
		if (!trimmed) {
			setError('Nazwa roli nie może być pusta')
			return
		}
		
		if (trimmed.length > 100) {
			setError('Nazwa roli nie może przekraczać 100 znaków')
			return
		}
		
		setUpdating(true)
		setError(null)
		setSuccess(null)
		
		try {
			await api.put(`/team-role/${roleId}`, {
				name: trimmed,
				color: editingRoleColor,
			})
			
			setEditingRoleId(null)
			setEditingRoleName('')
			setEditingRoleColor(null)
			setShowEditColorPicker(false)
			setSuccess('Rola została zaktualizowana')
			await fetchRoles()
			await fetchMembers()
			
			setTimeout(() => setSuccess(null), 2000)
		} catch (err: any) {
			console.error('Błąd aktualizacji roli:', err)
			const errorMsg = err?.response?.data?.message || err?.response?.data || 'Nie udało się zaktualizować roli'
			setError(errorMsg)
		} finally {
			setUpdating(false)
		}
	}

	const handleDeleteRole = (role: TeamRole) => {
		setRoleToDelete(role)
		setShowDeleteConfirmModal(true)
	}

	const handleConfirmDeleteRole = async () => {
		if (!roleToDelete) return
		
		setDeletingRoleId(roleToDelete.id)
		setError(null)
		setSuccess(null)
		setShowDeleteConfirmModal(false)
		
		try {
			await api.delete(`/team-role/${roleToDelete.id}`)
			
			setSuccess('Rola została usunięta')
			await fetchRoles()
			await fetchMembers()
			
			setTimeout(() => setSuccess(null), 2000)
		} catch (err: any) {
			console.error('Błąd usuwania roli:', err)
			const errorMsg = err?.response?.data?.message || err?.response?.data || 'Nie udało się usunąć roli'
			setError(errorMsg)
		} finally {
			setDeletingRoleId(null)
			setRoleToDelete(null)
		}
	}

	if (!isOpen) return null

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
			<div
				className='absolute inset-0 bg-black/60 backdrop-blur-sm'
				onClick={handleClose}
			/>

			<div className='relative w-full max-w-4xl bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200 max-h-[90vh] flex flex-col'>
				<div className='flex items-center justify-between p-5 border-b border-zinc-800'>
					<div className='flex items-center gap-2'>
						<Settings className='text-violet-400' size={20} />
						<h3 className='text-white text-lg font-semibold'>Zarządzaj rolami w drużynie</h3>
					</div>
					<button
						onClick={handleClose}
						className='p-2 rounded-xl hover:bg-zinc-800 transition-colors'
					>
						<X size={20} className='text-zinc-400 hover:text-white' />
					</button>
				</div>

				<div className='flex-1 p-5 space-y-6'>
					{error && (
						<div className='rounded-xl bg-red-900/40 border border-red-700 px-3 py-2 text-sm text-red-200 flex items-start gap-2'>
							<AlertTriangle size={16} />
							<span>{error}</span>
						</div>
					)}

					{success && (
						<div className='rounded-xl bg-emerald-900/40 border border-emerald-700 px-3 py-2 text-sm text-emerald-200 flex items-start gap-2'>
							<Check size={16} />
							<span>{success}</span>
						</div>
					)}

					{/* Formularz tworzenia nowej roli */}
					<div className='rounded-xl border border-zinc-800 bg-zinc-800/60 p-4'>
						<h4 className='text-white text-sm font-semibold mb-3 flex items-center gap-2'>
							<Plus size={16} />
							Dodaj nową rolę
						</h4>
						<form onSubmit={handleCreateRole} className='space-y-3'>
							<div className='flex gap-2'>
								<input
									type='text'
									value={newRoleName}
									onChange={e => setNewRoleName(e.target.value)}
									placeholder='Nazwa roli (np. Kapitan, Trener)'
									maxLength={100}
									className='flex-1 rounded-xl border border-zinc-700 bg-zinc-800/70 px-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500'
									disabled={creating}
								/>
								<TeamRoleColorPicker
									value={newRoleColor}
									onChange={setNewRoleColor}
									showPicker={showColorPicker}
									setShowPicker={setShowColorPicker}
								/>
								<button
									type='submit'
									disabled={creating || !newRoleName.trim()}
									className='inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
								>
									{creating ? (
										<>
											<Loader2 size={16} className='animate-spin' />
											Dodawanie...
										</>
									) : (
										<>
											<Plus size={16} />
											Dodaj
										</>
									)}
								</button>
							</div>
							<p className='text-xs text-zinc-400'>
								Maksymalnie 100 znaków. Nazwa musi być unikalna w drużynie. Kolor jest opcjonalny.
							</p>
						</form>
					</div>

					{/* Lista istniejących ról */}
					<div className='rounded-xl border border-zinc-800 bg-zinc-800/60 p-4'>
						<h4 className='text-white text-sm font-semibold mb-3'>
							Role w drużynie ({roles.length})
						</h4>
						
						{loading ? (
							<div className='flex items-center justify-center py-8'>
								<Loader2 className='animate-spin text-violet-400' size={24} />
								<span className='ml-2 text-zinc-400'>Ładowanie ról...</span>
							</div>
						) : roles.length === 0 ? (
							<div className='text-center py-8'>
								<p className='text-zinc-400 text-sm'>Brak ról w drużynie. Dodaj pierwszą rolę powyżej.</p>
							</div>
						) : (
							<div className='max-h-64 overflow-y-auto dark-scrollbar space-y-2 pr-2 -mr-2'>
								{roles.map(role => (
									<div
										key={role.id}
										className='flex items-center gap-3 rounded-lg bg-zinc-900/60 border border-zinc-700 p-3 hover:bg-zinc-900 transition-colors'
									>
										{editingRoleId === role.id ? (
											<>
												<input
													type='text'
													value={editingRoleName}
													onChange={e => setEditingRoleName(e.target.value)}
													maxLength={100}
													className='flex-1 rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500'
													disabled={updating}
													autoFocus
												/>
												<TeamRoleColorPicker
													value={editingRoleColor}
													onChange={setEditingRoleColor}
													showPicker={showEditColorPicker}
													setShowPicker={setShowEditColorPicker}
												/>
												<button
													onClick={() => handleUpdateRole(role.id)}
													disabled={updating || !editingRoleName.trim()}
													className='inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
												>
													{updating ? (
														<Loader2 size={14} className='animate-spin' />
													) : (
														<Check size={14} />
													)}
													Zapisz
												</button>
												<button
													onClick={handleCancelEdit}
													disabled={updating}
													className='px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
												>
													Anuluj
												</button>
											</>
										) : (
											<>
												<div className='flex-1'>
													<div className='flex items-center gap-2'>
														<div className='text-white text-sm font-medium'>{role.name}</div>
														{role.color && (
															<div
																className='w-4 h-4 rounded border border-zinc-600'
																style={{ backgroundColor: role.color }}
																title={`Kolor: ${role.color}`}
															/>
														)}
													</div>
													<div className='text-xs text-zinc-400 mt-0.5'>
														Utworzono: {parseLocalDate(role.createdAt).format('DD.MM.YYYY')}
													</div>
												</div>
												<button
													onClick={() => handleStartEdit(role)}
													className='p-2 rounded-lg text-zinc-400 hover:text-violet-400 hover:bg-zinc-800 transition-colors'
													title='Edytuj rolę'
												>
													<Edit2 size={16} />
												</button>
												<button
													onClick={() => handleDeleteRole(role)}
													disabled={deletingRoleId === role.id}
													className='p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
													title='Usuń rolę'
												>
													{deletingRoleId === role.id ? (
														<Loader2 size={16} className='animate-spin' />
													) : (
														<Trash2 size={16} />
													)}
												</button>
											</>
										)}
									</div>
								))}
							</div>
						)}
					</div>

					{/* Lista członków z przypisaniem ról */}
					<div className='rounded-xl border border-zinc-800 bg-zinc-800/60 p-4'>
						<h4 className='text-white text-sm font-semibold mb-3 flex items-center gap-2'>
							<Users size={16} />
							Przypisz role członkom ({members.length})
						</h4>
						
						{membersLoading ? (
							<div className='flex items-center justify-center py-8'>
								<Loader2 className='animate-spin text-violet-400' size={24} />
								<span className='ml-2 text-zinc-400'>Ładowanie członków...</span>
							</div>
						) : members.length === 0 ? (
							<div className='text-center py-8'>
								<p className='text-zinc-400 text-sm'>Brak członków w drużynie (poza liderem).</p>
							</div>
						) : (
							<div className='space-y-2'>
								{members.map(member => (
									<div
										key={member.id}
										className='flex items-center gap-3 rounded-lg bg-zinc-900/60 border border-zinc-700 p-3 hover:bg-zinc-900 transition-colors'
									>
										<Avatar
											src={member.userAvatarUrl || null}
											name={member.userName}
											size='sm'
											className='ring-1 ring-zinc-700'
										/>
										<div className='flex-1 min-w-0'>
											<div className='text-white text-sm font-medium truncate'>{member.userName}</div>
											{member.roleName && (
												<div className='text-xs text-violet-400 mt-0.5'>
													Aktualna rola: {member.roleName}
												</div>
											)}
										</div>
										<select
											value={member.roleId || ''}
											onChange={e => {
												const newRoleId = e.target.value ? parseInt(e.target.value) : null
												handleAssignRole(member.userId, newRoleId)
											}}
											disabled={assigningRole === member.userId}
											className='rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 disabled:opacity-50 disabled:cursor-not-allowed min-w-[150px]'
										>
											<option value=''>Brak roli</option>
											{roles.map(role => (
												<option key={role.id} value={role.id}>
													{role.name}
												</option>
											))}
										</select>
										{assigningRole === member.userId && (
											<Loader2 size={16} className='animate-spin text-violet-400' />
										)}
									</div>
								))}
							</div>
						)}
					</div>
				</div>

				<div className='p-5 border-t border-zinc-800 flex justify-end'>
					<button
						onClick={handleClose}
						className='px-4 py-2 rounded-xl text-sm font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 transition-colors'
					>
						Zamknij
					</button>
				</div>
			</div>

			<AlertModal
				isOpen={showDeleteConfirmModal}
				onClose={() => {
					setShowDeleteConfirmModal(false)
					setRoleToDelete(null)
				}}
				title='Usuń rolę'
				message={
					roleToDelete
						? `Czy na pewno chcesz usunąć rolę "${roleToDelete.name}"? Członkowie z tą rolą stracą przypisanie.`
						: ''
				}
				variant='warning'
				showConfirm={true}
				onConfirm={handleConfirmDeleteRole}
				confirmText='Usuń rolę'
				cancelText='Anuluj'
				isLoading={deletingRoleId !== null}
			/>
		</div>
	)
}

export default TeamRoleManagementModal
