package com.joinmatch.backend.service;

import com.joinmatch.backend.dto.EventResponseDto;
import com.joinmatch.backend.repository.SportTypeRepository;
import com.joinmatch.backend.dto.SportTypeResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SportTypeService {
    private final SportTypeRepository sportTypeRepository;

    public List<SportTypeResponseDto> getAllSportTypes() {
        return sportTypeRepository.findAll()
                .stream()
                .map(SportTypeResponseDto::fromSportType)
                .toList();
    }
}
