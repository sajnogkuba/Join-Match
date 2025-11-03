import React from 'react'
import Avatar from './Avatar'
import StarRatingDisplay from './StarRatingDisplay'
import { parseLocalDate } from '../utils/formatDate'
import { Edit, Trash2 } from 'lucide-react'

interface RatingCardProps {
  rating: number
  comment: string
  raterName: string
  raterAvatarUrl?: string
  raterEmail?: string
  createdAt: string
  isMine: boolean
  onEdit: () => void
  onDelete: () => void
}

const RatingCard: React.FC<RatingCardProps> = ({
  rating,
  comment,
  raterName,
  raterAvatarUrl,
  raterEmail,
  createdAt,
  isMine,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <Avatar src={raterAvatarUrl || null} name={raterName} size="sm" className="ring-1 ring-zinc-700" />
          <div className="leading-tight">
            <div className="text-white text-sm font-medium">{raterName}</div>
            {raterEmail && <div className="text-xs text-zinc-400">{raterEmail}</div>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-500">{parseLocalDate(createdAt).format('DD.MM.YYYY HH:mm')}</span>
          {isMine && (
            <div className="flex gap-2">
              <button
                className="text-xs text-zinc-300 hover:text-white cursor-pointer"
                onClick={onEdit}
              >
                <Edit size={14} />
              </button>
              <button
                className="text-xs text-rose-400 hover:text-rose-300 cursor-pointer"
                onClick={onDelete}
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <StarRatingDisplay value={rating} size={18} />
        {comment && <p className="text-sm text-zinc-300 mt-2">{comment}</p>}
      </div>
    </div>
  )
}

export default RatingCard
