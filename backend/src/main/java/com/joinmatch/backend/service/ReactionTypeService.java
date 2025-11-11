package com.joinmatch.backend.service;

import com.joinmatch.backend.dto.ReactionType.ReactionTypeResponseDto;
import com.joinmatch.backend.repository.ReactionTypeRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class ReactionTypeService {
    private final ReactionTypeRepository reactionTypeRepository;

    public List<ReactionTypeResponseDto> getAllReactionTypes() {
        var reactionTypes = reactionTypeRepository.findAll();
        return reactionTypes.stream()
                .map(ReactionTypeResponseDto::fromEntity)
                .toList();
    }
}
