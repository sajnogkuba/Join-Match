export type SimpleUser = {
	name: string
	email: string
	urlOfPicture: string | null
}

// Używamy angielskich kluczy jako stabilnych identyfikatorów, żeby uniknąć problemów z kodowaniem znaków.
export type SidebarItemKey =
	| 'general'
	| 'password'
	| 'friends'
	| 'ratings'
	| 'my-events'
	| 'participations'
	| 'badges'
