import { GoogleMap, MarkerF, InfoWindowF, useJsApiLoader } from '@react-google-maps/api'
import { useState, useEffect, useRef } from 'react'
import dayjs from 'dayjs'
import { Link } from 'react-router-dom'

interface MapEvent {
	eventId: number
	eventName: string
	eventDate: string | Date
	sportObjectName: string
	latitude: number
	longitude: number
	city?: string
	sportTypeName?: string
	cost?: number
	imageUrl?: string
	skillLevel?: string
}

const containerStyle = {
	width: '100%',
	height: '520px',
	borderRadius: '1rem',
}

// 🔹 Współrzędne wybranych miast dla filtrowania
const CITY_COORDS: Record<string, { lat: number; lng: number; zoom: number }> = {
	warszawa: { lat: 52.2297, lng: 21.0122, zoom: 11 },
	kraków: { lat: 50.0647, lng: 19.945, zoom: 12 },
	poznan: { lat: 52.4064, lng: 16.9252, zoom: 12 },
	gdańsk: { lat: 54.352, lng: 18.6466, zoom: 12 },
	wrocław: { lat: 51.1079, lng: 17.0385, zoom: 12 },
	lublin: { lat: 51.2465, lng: 22.5684, zoom: 12 },
	szczecin: { lat: 53.4285, lng: 14.5528, zoom: 12 },
	łódź: { lat: 51.7592, lng: 19.456, zoom: 12 },
}

const POLAND_CENTER = { lat: 52.0693, lng: 19.4803 } // środek Polski

const MapView = ({ events, selectedCity }: { events: MapEvent[]; selectedCity?: string }) => {
	const { isLoaded } = useJsApiLoader({
		id: 'google-map-script',
		googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY!,
	})

	const [selected, setSelected] = useState<MapEvent | null>(null)
	const mapRef = useRef<google.maps.Map | null>(null)

	// Ustawienie centrum mapy — domyślnie Polska
	const [center, setCenter] = useState(POLAND_CENTER)
	const [zoom, setZoom] = useState(6)

	useEffect(() => {
		if (selectedCity && CITY_COORDS[selectedCity.toLowerCase()]) {
			const c = CITY_COORDS[selectedCity.toLowerCase()]
			setCenter({ lat: c.lat, lng: c.lng })
			setZoom(c.zoom)
			mapRef.current?.panTo({ lat: c.lat, lng: c.lng })
			mapRef.current?.setZoom(c.zoom)
		} else {
			setCenter(POLAND_CENTER)
			setZoom(6)
			mapRef.current?.setZoom(6)
			mapRef.current?.panTo(POLAND_CENTER)
		}
	}, [selectedCity])

	// Fioletowa pinezka SVG jako data URL
	const pinSvgDataUrl = (color = '#7c3aed') => {
		const svg = `
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='48' height='48'>
        <path fill='${color}' d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z'/>
        <circle cx='12' cy='9' r='3.5' fill='white' />
      </svg>`
		return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
	}

	if (!isLoaded)
		return (
			<div className='grid h-[520px] place-items-center rounded-2xl border border-zinc-800 bg-zinc-900/60 text-zinc-300'>
				Ładowanie mapy…
			</div>
		)

	if (events.length === 0)
		return (
			<div className='grid h-[520px] place-items-center rounded-2xl border border-zinc-800 bg-zinc-900/60 text-center'>
				<div>
					<div className='text-4xl mb-3'>📍</div>
					<p className='text-white font-semibold'>Brak wydarzeń z lokalizacją</p>
				</div>
			</div>
		)

	return (
		<div className='relative overflow-hidden rounded-2xl border border-zinc-800'>
			<GoogleMap
				onLoad={(map) => {
					mapRef.current = map
				}}
				mapContainerStyle={containerStyle}
				center={center}
				zoom={zoom}
				options={{
					styles: [
						{ elementType: 'geometry', stylers: [{ color: '#1f2632' }] },
						{ elementType: 'labels.text.stroke', stylers: [{ color: '#1f2632' }] },
						{ elementType: 'labels.text.fill', stylers: [{ color: '#d3d3d3' }] },
						{ featureType: 'water', stylers: [{ color: '#2a3342' }] },
					],
					disableDefaultUI: true,
					zoomControl: true,
				}}>
				{events.map(ev => (
					<MarkerF
						key={ev.eventId}
						position={{ lat: ev.latitude, lng: ev.longitude }}
						title={ev.eventName}
						onClick={() => setSelected(ev)}
						icon={{
							url: pinSvgDataUrl('#7c3aed'),
							scaledSize: new google.maps.Size(40, 40),
							anchor: new google.maps.Point(20, 40),
						}}
					/>
				))}

				{selected && (
					<InfoWindowF
						position={{ lat: selected.latitude, lng: selected.longitude }}
						onCloseClick={() => setSelected(null)}>
						<div className='text-sm text-zinc-800 max-w-[220px]'>
							{selected.imageUrl && (
								<img
									src={selected.imageUrl}
									alt={selected.eventName}
									className='rounded-md w-full h-24 object-cover mb-2'
								/>
							)}
							<h3 className='font-semibold text-violet-700 mb-1 line-clamp-1'>{selected.eventName}</h3>
							<p className='text-xs text-zinc-600 mb-1'>
								{dayjs(selected.eventDate).format('DD.MM.YYYY HH:mm')}
							</p>
							{selected.sportTypeName && (
								<p className='text-xs text-zinc-600 mb-1'>
									🏅 {selected.sportTypeName} —{' '}
									<span className='font-medium'>{selected.skillLevel || 'brak'}</span>
								</p>
							)}
							<p className='text-xs text-zinc-600 mb-1'>📍 {selected.sportObjectName}</p>
							{selected.cost != null && (
								<p className='text-xs text-zinc-600 mb-2'>
									💰 {new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(selected.cost)}
								</p>
							)}
							<Link
								to={`/event/${selected.eventId}`}
								className='text-violet-600 text-xs font-semibold hover:underline'>
								Szczegóły →
							</Link>
						</div>
					</InfoWindowF>
				)}
			</GoogleMap>
		</div>
	)
}

export default MapView
