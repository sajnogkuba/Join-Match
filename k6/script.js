// script.js
import http from 'k6/http'
import { check, sleep, fail } from 'k6'

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080'

export const options = {
    stages: [
        { duration: '30s', target: 50 }, // Rozpędzamy się do 50 userów (a nie 500)
        { duration: '1m', target: 50 },  // Utrzymujemy 50 userów przez minutę
        { duration: '10s', target: 0 },  // Wyhamowujemy
    ],
    thresholds: {
        http_req_duration: ['p(95)<3000'], // Oczekujemy czasu poniżej 3s (powinno wyjść < 500ms)
        http_req_failed: ['rate<0.01'],    // Zero błędów
    },
};

export function setup() {
	const payload = JSON.stringify({ email: 'test@gmail.com', password: 'test' })
	const res = http.post(`${BASE_URL}/api/auth/login`, payload, {
		headers: { 'Content-Type': 'application/json' },
	})

	if (res.status !== 200) {
		console.error('Błąd logowania:', res.status, res.body)
		fail('Login failed')
	}

	// 1. Próbujemy pobrać token z JSON (jak wcześniej)
	let token = res.json('token') || res.json('accessToken')

	// 2. NOWOŚĆ: Jeśli nie ma w JSON, szukamy w ciasteczku "accessToken"
	// (Zakładam, że tak nazywa się ciastko w CookieUtil)
	if (!token && res.cookies && res.cookies.accessToken) {
		console.log('Pobrano token z ciasteczka!')
		token = res.cookies.accessToken[0].value
	}

	// Jeśli nadal brak tokena, to znaczy, że backend go nie zwrócił w ogóle
	if (!token) {
		console.warn('UWAGA: Nie znaleziono tokena w JSON ani w Cookie accessToken.')
		// Jeśli Twoja aplikacja działa TYLKO na ciastkach (bez nagłówka Authorization),
		// to token może być null, ale wtedy CookieJar musi działać idealnie.
	}

	return { token, cookies: res.cookies }
}

function authHeaders(data) {
	const headers = {}
	if (data.token) headers['Authorization'] = `Bearer ${data.token}`
	return headers
}

export default function (data) {
	// --- POPRAWKA: cookieJar musi być tutaj, wewnątrz funkcji ---
	const jar = http.cookieJar()

	// Przekazujemy ciasteczka z logowania (setup) do obecnego wirtualnego usera
	if (data.cookies) {
		for (const [name, cookieArr] of Object.entries(data.cookies)) {
			const value = cookieArr?.[0]?.value
			if (value) jar.set(BASE_URL, name, value)
		}
	}

	const headers = authHeaders(data)

	// 1. Pobranie listy eventów
	const eventRes = http.get(`${BASE_URL}/api/event?page=0&size=12&sortBy=eventDate&direction=ASC`, {
		headers,
		tags: { endpoint: 'event_list' },
	})
	check(eventRes, { 'event 200': r => r.status === 200 })

	// 2. Wyszukiwanie (ID 10 szuka 'jan')
	const searchRes = http.get(`${BASE_URL}/api/auth/search?query=jan&senderId=10`, {
		headers,
		tags: { endpoint: 'user_search' },
	})
	check(searchRes, { 'search 200': r => r.status === 200 })

	// 3. Wiadomości (Konwersacja nr 2, w której jest user 10)
	const messagesRes = http.get(`${BASE_URL}/api/conversations/2/messages`, {
		headers,
		tags: { endpoint: 'conversation_messages' },
	})
	check(messagesRes, { 'messages 200': r => r.status === 200 })

	sleep(1)
}
