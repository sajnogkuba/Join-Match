package com.joinmatch.backend.service;

import com.joinmatch.backend.dto.SportObject.SportObjectRequestDto;
import com.joinmatch.backend.dto.SportObject.SportObjectResponseDto;
import com.joinmatch.backend.model.SportObject;
import com.joinmatch.backend.repository.SportObjectRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SportObjectService {

    private final SportObjectRepository sportObjectRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${google.api.key}")
    private String googleApiKey;

    public List<SportObjectResponseDto> getAll() {
        return sportObjectRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public SportObjectResponseDto getById(Integer id) {
        return sportObjectRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new EntityNotFoundException("SportObject with id " + id + " not found"));
    }

    @Transactional
    public SportObjectResponseDto create(SportObjectRequestDto dto) {
        SportObject sportObject = new SportObject();
        return saveSportObject(dto, sportObject);
    }

    @Transactional
    public SportObjectResponseDto update(Integer id, SportObjectRequestDto dto) {
        SportObject sportObject = sportObjectRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("SportObject with id " + id + " not found"));
        return saveSportObject(dto, sportObject);
    }

    private SportObjectResponseDto saveSportObject(SportObjectRequestDto dto, SportObject sportObject) {
        sportObject.setName(dto.name());
        sportObject.setCity(dto.city());
        sportObject.setStreet(dto.street());
        sportObject.setNumber(dto.number());
        sportObject.setSecondNumber(dto.secondNumber());

        Double lat = dto.latitude();
        Double lng = dto.longitude();

        if (lat == null || lng == null) {
            double[] coords = geocodeAddress(dto);
            lat = coords[0];
            lng = coords[1];
        }

        sportObject.setLatitude(lat);
        sportObject.setLongitude(lng);

        SportObject saved = sportObjectRepository.save(sportObject);
        return mapToResponse(saved);
    }

    private double[] geocodeAddress(SportObjectRequestDto dto) {
        try {
            String address = String.format("%s %s %s",
                    dto.city(),
                    dto.street(),
                    dto.number() != null ? dto.number() : "");
            String encoded = URLEncoder.encode(address, StandardCharsets.UTF_8);
            String url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + encoded + "&key=" + googleApiKey;

            Map<?, ?> response = restTemplate.getForObject(url, Map.class);
            if (response == null || !"OK".equals(response.get("status"))) {
                return new double[]{0.0, 0.0};
            }

            var results = (List<Map<String, Object>>) response.get("results");
            if (results.isEmpty()) return new double[]{0.0, 0.0};

            var location = (Map<String, Object>) ((Map<String, Object>) results.get(0).get("geometry")).get("location");
            double lat = (double) location.get("lat");
            double lng = (double) location.get("lng");
            return new double[]{lat, lng};
        } catch (Exception e) {
            e.printStackTrace();
            return new double[]{0.0, 0.0};
        }
    }

    private SportObjectResponseDto mapToResponse(SportObject obj) {
        return new SportObjectResponseDto(
                obj.getObjectId(),
                obj.getName(),
                obj.getCity(),
                obj.getStreet(),
                obj.getNumber(),
                obj.getSecondNumber(),
                obj.getLatitude(),
                obj.getLongitude()
        );
    }

    public void deleteById(Integer id) {
        if (!sportObjectRepository.existsById(id)) {
            throw new EntityNotFoundException("SportObject with id " + id + " not found");
        }
        sportObjectRepository.deleteById(id);
    }
}
