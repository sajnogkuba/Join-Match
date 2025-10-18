import { GoogleMap, MarkerF, InfoWindowF, useJsApiLoader } from '@react-google-maps/api'
import { useMemo, useState, useEffect, useRef } from 'react'
import dayjs from 'dayjs'
import { Link } from 'react-router-dom'

interface MapEvent {
	eventId: number
	eventName: string
	eventDate: string | Date
	sportObjectName: string
	latitude: number
	longitude: number
}

const containerStyle = {
	width: '100%',
	height: '520px',
	borderRadius: '1rem',
}

const MapView = ({ events }: { events: MapEvent[] }) => {
	const { isLoaded } = useJsApiLoader({
		id: 'google-map-script',
		googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY!, // 👈 klucz z .env
	})

	const [selected, setSelected] = useState<MapEvent | null>(null)
	const mapRef = useRef<google.maps.Map | null>(null)

	const center = useMemo(() => {
		if (events.length === 0) return { lat: 52.2297, lng: 21.0122 } // Warszawa
		const avgLat = events.reduce((sum, e) => sum + (e.latitude || 0), 0) / events.length
		const avgLng = events.reduce((sum, e) => sum + (e.longitude || 0), 0) / events.length
		return { lat: avgLat, lng: avgLng }
	}, [events])

	// 🔹 Automatyczne dopasowanie zoomu do wszystkich markerów
	useEffect(() => {
		if (!mapRef.current || events.length === 0) return
		const bounds = new google.maps.LatLngBounds()
		events.forEach(e => bounds.extend({ lat: e.latitude, lng: e.longitude }))
		mapRef.current.fitBounds(bounds)
	}, [events])

	// Funkcja zwracająca fioletową pinezkę SVG jako data URI
	const pinSvgDataUrl = (color = '#7c3aed') => {
		const svg =
			`<?xml version='1.0' encoding='UTF-8'?>` +
			`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='48' height='48'>` +
			`<path fill='${color}' d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z'/><circle cx='12' cy='9' r='3.5' fill='white' />` +
			`</svg>`
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
					<p className='text-sm text-zinc-400 mt-1'>Dodaj obiekty ze współrzędnymi, by zobaczyć je na mapie.</p>
				</div>
			</div>
		)

	return (
		<div className='relative overflow-hidden rounded-2xl border border-zinc-800'>
			<GoogleMap
				onLoad={map => {
					mapRef.current = map
				}}
				mapContainerStyle={containerStyle}
				center={center}
				zoom={11}
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
							scaledSize: new google.maps.Size(48, 48),
							anchor: new google.maps.Point(24, 48),
						}}
					/>
				))}

				{selected && (
					<InfoWindowF
						position={{ lat: selected.latitude, lng: selected.longitude }}
						onCloseClick={() => setSelected(null)}>
						<div className='text-sm text-zinc-800 max-w-[200px]'>
							<h3 className='font-semibold text-violet-700 mb-1'>{selected.eventName}</h3>
							<p className='text-xs text-zinc-600 mb-1'>{dayjs(selected.eventDate).format('DD.MM.YYYY HH:mm')}</p>
							<p className='text-xs text-zinc-600 mb-2'>{selected.sportObjectName}</p>
							<Link to={`/event/${selected.eventId}`} className='text-violet-600 text-xs font-semibold hover:underline'>
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
