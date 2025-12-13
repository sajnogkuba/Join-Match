export const isSystemUser = (user?: { email?: string; name?: string }) =>
	user?.email === 'system@joinmatch.pl' || user?.name === 'System'
