package com.joinmatch.backend.Service;

import com.joinmatch.backend.dto.ReactionType.ReactionTypeResponseDto;
import com.joinmatch.backend.model.ReactionType;
import com.joinmatch.backend.repository.ReactionTypeRepository;
import com.joinmatch.backend.service.ReactionTypeService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReactionTypeServiceTest {

    @Mock
    private ReactionTypeRepository reactionTypeRepository;

    @InjectMocks
    private ReactionTypeService reactionTypeService;

    @Test
    void getAllReactionTypes_shouldReturnMappedDtos() {
        // given
        ReactionType like = new ReactionType();
        like.setId(1);
        like.setName("LIKE");
        like.setEmoji("👍");
        like.setDescription("Positive reaction");

        ReactionType dislike = new ReactionType();
        dislike.setId(2);
        dislike.setName("DISLIKE");
        dislike.setEmoji("👎");
        dislike.setDescription("Negative reaction");

        when(reactionTypeRepository.findAll()).thenReturn(List.of(like, dislike));

        // when
        List<ReactionTypeResponseDto> result = reactionTypeService.getAllReactionTypes();

        // then
        assertEquals(2, result.size());

        ReactionTypeResponseDto r1 = result.get(0);
        assertEquals(1, r1.id());
        assertEquals("LIKE", r1.name());
        assertEquals("👍", r1.emoji());
        assertEquals("Positive reaction", r1.description());

        ReactionTypeResponseDto r2 = result.get(1);
        assertEquals(2, r2.id());
        assertEquals("DISLIKE", r2.name());
        assertEquals("👎", r2.emoji());
        assertEquals("Negative reaction", r2.description());

        verify(reactionTypeRepository, times(1)).findAll();
    }
}
