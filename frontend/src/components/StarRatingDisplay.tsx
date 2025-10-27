import { useId } from 'react'

type StarRatingDisplayProps = {
	value: number
	max?: number
	size?: number
}

export default function StarRatingDisplay({ value, max = 5, size = 20 }: StarRatingDisplayProps) {
	const idPrefix = useId()
	const clamped = Math.max(0, Math.min(max, value))

	return (
		<div className='inline-flex items-center gap-1'>
			{Array.from({ length: max }, (_, i) => {
				const fill = Math.max(0, Math.min(1, clamped - i)) // 0..1 fill for this star
				const fillPercent = Math.round(fill * 100)
				const gradId = `half-${idPrefix}-${i}`
				const isFull = fillPercent === 100
				const isEmpty = fillPercent === 0

				return (
					<svg key={i} width={size} height={size} viewBox='0 0 24 24' className='drop-shadow-sm' aria-hidden='true'>
						{!isFull && !isEmpty && (
							<defs>
								<linearGradient id={gradId} x1='0' x2='1' y1='0' y2='0'>
									<stop offset={`${fillPercent}%`} stopColor='#8b5cf6' />
									<stop offset={`${fillPercent}%`} stopColor='transparent' />
								</linearGradient>
							</defs>
						)}
						<path
							d='M12 2l3.09 6.26L22 9.27l-5 4.88L18.18 22 12 18.6 5.82 22 7 14.15l-5-4.88 6.91-1.01L12 2z'
							fill={isFull ? '#8b5cf6' : isEmpty ? 'transparent' : `url(#${gradId})`}
							stroke='#a1a1aa'
							strokeWidth={isEmpty ? 2 : 0}
						/>
					</svg>
				)
			})}
		</div>
	)
}
