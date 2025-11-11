export const extractMentionedUserIds = (htmlContent: string): number[] => {
	const parser = new DOMParser()
	const doc = parser.parseFromString(htmlContent, 'text/html')
	const mentionElements = doc.querySelectorAll('span.mention[data-id], span[data-type="mention"][data-id]')
	const userIds: number[] = []
	
	mentionElements.forEach((element) => {
		const userId = element.getAttribute('data-id')
		if (userId) {
			const id = parseInt(userId, 10)
			if (!isNaN(id)) {
				userIds.push(id)
			}
		}
	})
	
	return [...new Set(userIds)]
}

export const convertEmoticonsToEmoji = (text: string): string => {
	const emoticonMap: Record<string, string> = {
		':)': '😊',
		':-)': '😊',
		':(': '😢',
		':-(': '😢',
		':D': '😃',
		':-D': '😃',
		':P': '😛',
		':-P': '😛',
		';)': '😉',
		';-)': '😉',
		':O': '😮',
		':-O': '😮',
		':*': '😘',
		':-*': '😘',
		'<3': '❤️',
		'</3': '💔',
		':3': '😸',
		':|': '😐',
		':-|': '😐',
		':/': '😕',
		':-/': '😕',
		':\\': '😕',
		':-\\': '😕',
		'xD': '😆',
		'XD': '😆',
		'x)': '😆',
		'X)': '😆',
	}
	
	let result = text
	const sortedEntries = Object.entries(emoticonMap).sort((a, b) => b[0].length - a[0].length)
	
	for (const [emoticon, emoji] of sortedEntries) {
		const escaped = emoticon.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
		result = result.replace(new RegExp(escaped, 'g'), emoji)
	}
	
	return result
}

