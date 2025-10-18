// PlaceAutocomplete.tsx (Wersja 2: Unikanie Legacy Widgetu)
import { useEffect, useRef, useState, useCallback } from 'react'

type PlaceAutocompleteProps = {
	onSelect: (place: google.maps.places.PlaceResult) => void
	placeholder?: string
}

// Klasa do pobierania szczegółów miejsca
let placesService: google.maps.places.PlacesService | null = null
// Klasa do pobierania podpowiedzi autouzupełniania
let autocompleteService: google.maps.places.AutocompleteService | null = null

export default function PlaceAutocomplete({ onSelect, placeholder }: PlaceAutocompleteProps) {
	const [inputValue, setInputValue] = useState('')
	const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([])
	const [showDropdown, setShowDropdown] = useState(false)
	const containerRef = useRef<HTMLDivElement>(null)

	// Inicjalizacja usług Google, gdy tylko są dostępne
	useEffect(() => {
		if (window.google?.maps?.places) {
			const map = document.createElement('div') // PlacesService wymaga obiektu Map, ale wystarczy mu DOM Element
			placesService = new google.maps.places.PlacesService(map)
			autocompleteService = new google.maps.places.AutocompleteService()
		}
	}, [])

	// Funkcja do pobierania szczegółów miejsca
	const fetchPlaceDetails = useCallback(
		(placeId: string) => {
			if (!placesService) return
			placesService.getDetails(
				{ placeId, fields: ['name', 'formatted_address', 'geometry', 'address_components'] },
				(place, status) => {
					if (status === google.maps.places.PlacesServiceStatus.OK && place) {
						// Konwersja na kompatybilny typ dla onSelect
						onSelect(place as google.maps.places.PlaceResult)
						setInputValue(place.name || place.formatted_address || '')
						setPredictions([])
					}
				}
			)
		},
		[onSelect]
	)

	// Funkcja do wyszukiwania podpowiedzi
	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const value = event.target.value
		setInputValue(value)

		if (value.length < 3 || !autocompleteService) {
			setPredictions([])
			setShowDropdown(false)
			return
		}

		autocompleteService.getPlacePredictions(
			{
				input: value,
				types: ['establishment', 'geocode'],
				componentRestrictions: { country: 'pl' },
			},
			(predictionsList, status) => {
				if (status === google.maps.places.PlacesServiceStatus.OK && predictionsList) {
					setPredictions(predictionsList)
					setShowDropdown(true)
				} else {
					setPredictions([])
					setShowDropdown(false)
				}
			}
		)
	}

	// Obsługa kliknięcia poza komponentem
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setShowDropdown(false)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	return (
		<div ref={containerRef} className='relative'>
			<input
				type='text'
				placeholder={placeholder || 'Wyszukaj obiekt...'}
				value={inputValue}
				onChange={handleInputChange}
				onFocus={() => inputValue.length >= 3 && predictions.length > 0 && setShowDropdown(true)}
				className='w-full px-4 py-3 rounded-xl bg-zinc-900/70 border border-zinc-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-600 focus:border-transparent transition'
			/>
			{showDropdown && predictions.length > 0 && (
				<ul className='absolute z-10 w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl max-h-60 overflow-y-auto shadow-xl'>
					{predictions.map(prediction => (
						<li
							key={prediction.place_id}
							className='px-4 py-3 cursor-pointer hover:bg-violet-900/40 transition-colors border-b border-zinc-800 last:border-b-0'
							onClick={() => {
								fetchPlaceDetails(prediction.place_id)
								setShowDropdown(false)
							}}>
							{prediction.description}
						</li>
					))}
				</ul>
			)}
		</div>
	)
}
