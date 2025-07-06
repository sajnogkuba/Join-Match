package com.joinmatch.backend.service;

import com.joinmatch.backend.dto.SportObjectRequestDto;
import com.joinmatch.backend.dto.SportObjectResponseDto;
import com.joinmatch.backend.entity.SportObject;
import com.joinmatch.backend.repository.SportObjectRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SportObjectService {

    private final SportObjectRepository sportObjectRepository;

    public List<SportObjectResponseDto> getAll() {
        return sportObjectRepository.findAll()
                .stream()
                .map(sportObject -> new SportObjectResponseDto(
                        sportObject.getObjectId(),
                        sportObject.getName(),
                        sportObject.getCity(),
                        sportObject.getStreet(),
                        sportObject.getNumber(),
                        sportObject.getSecondNumber(),
                        sportObject.getCapacity()
                ))
                .toList();
    }

    public SportObjectResponseDto getById(Integer id) {
        return sportObjectRepository.findById(id)
                .map(sportObject -> new SportObjectResponseDto(
                        sportObject.getObjectId(),
                        sportObject.getName(),
                        sportObject.getCity(),
                        sportObject.getStreet(),
                        sportObject.getNumber(),
                        sportObject.getSecondNumber(),
                        sportObject.getCapacity()
                ))
                .orElseThrow(() -> new EntityNotFoundException("SportObject with id " + id + " not found"));
    }

    @Transactional
    public void deleteById(Integer id) {
        if (!sportObjectRepository.existsById(id)) {
            throw new EntityNotFoundException("SportObject with id " + id + " not found");
        }
        sportObjectRepository.deleteById(id);
    }

    @Transactional
    public SportObjectResponseDto create(SportObjectRequestDto sportObjectRequestDto) {
        SportObject sportObject = new SportObject();
        return getSportObjectResponseDto(sportObjectRequestDto, sportObject);
    }

    @Transactional
    public SportObjectResponseDto update(Integer id, SportObjectRequestDto sportObjectRequestDto) {
        SportObject sportObject = sportObjectRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("SportObject with id " + id + " not found"));
        return getSportObjectResponseDto(sportObjectRequestDto, sportObject);
    }

    private SportObjectResponseDto getSportObjectResponseDto(SportObjectRequestDto sportObjectRequestDto, SportObject sportObject) {
        sportObject.setName(sportObjectRequestDto.name());
        sportObject.setCity(sportObjectRequestDto.city());
        sportObject.setStreet(sportObjectRequestDto.street());
        sportObject.setNumber(sportObjectRequestDto.number());
        sportObject.setSecondNumber(sportObjectRequestDto.secondNumber());
        sportObject.setCapacity(sportObjectRequestDto.capacity());
        SportObject updated = sportObjectRepository.save(sportObject);
        return new SportObjectResponseDto(
                updated.getObjectId(),
                updated.getName(),
                updated.getCity(),
                updated.getStreet(),
                updated.getNumber(),
                updated.getSecondNumber(),
                updated.getCapacity()
        );
    }
}
