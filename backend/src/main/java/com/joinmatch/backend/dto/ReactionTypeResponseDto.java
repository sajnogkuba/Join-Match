package com.joinmatch.backend.dto;


import com.joinmatch.backend.model.ReactionType;

public record ReactionTypeResponseDto(
        Integer id,
        String name,
        String emoji,
        String description
) {

    public static ReactionTypeResponseDto fromEntity(ReactionType reactionType) {
        return new ReactionTypeResponseDto(
                reactionType.getId(),
                reactionType.getName(),
                reactionType.getEmoji(),
                reactionType.getDescription()
        );
    }
}
