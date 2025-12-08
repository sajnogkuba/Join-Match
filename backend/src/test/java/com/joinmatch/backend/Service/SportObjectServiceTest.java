package com.joinmatch.backend.Service;

import com.joinmatch.backend.dto.SportObject.SportObjectRequestDto;
import com.joinmatch.backend.dto.SportObject.SportObjectResponseDto;
import com.joinmatch.backend.model.SportObject;
import com.joinmatch.backend.repository.SportObjectRepository;
import com.joinmatch.backend.service.SportObjectService;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
//TODO problem z mokowaniem jednej metody, która wewnątrz używa prywatnej metody
@ExtendWith(MockitoExtension.class)
class SportObjectServiceTest {

    @Mock
    private SportObjectRepository sportObjectRepository;

    @InjectMocks
    @Spy
    private SportObjectService sportObjectService;

    // ----------------------------
    // getAll()
    // ----------------------------
    @Test
    void getAll_shouldReturnMappedDtos() {
        SportObject obj = new SportObject();
        obj.setObjectId(1);
        obj.setName("Arena");
        obj.setCity("Kraków");
        obj.setStreet("Testowa");
        obj.setNumber(10);
        obj.setLatitude(50.0);
        obj.setLongitude(19.0);

        when(sportObjectRepository.findAll()).thenReturn(List.of(obj));

        List<SportObjectResponseDto> result = sportObjectService.getAll();

        assertEquals(1, result.size());
        assertEquals("Arena", result.get(0).name());
    }

    // ----------------------------
    // getById()
    // ----------------------------
    @Test
    void getById_shouldReturnDto() {
        SportObject obj = new SportObject();
        obj.setObjectId(1);
        obj.setName("Hala");
        when(sportObjectRepository.findById(1)).thenReturn(Optional.of(obj));

        SportObjectResponseDto dto = sportObjectService.getById(1);

        assertEquals("Hala", dto.name());
    }

    @Test
    void getById_shouldThrowIfNotFound() {
        when(sportObjectRepository.findById(1)).thenReturn(Optional.empty());
        assertThrows(EntityNotFoundException.class, () -> sportObjectService.getById(1));
    }


    // ----------------------------
    // create() – gdy lat/lng podane
    // ----------------------------
    @Test
    void create_shouldNotCallGeocodeIfLatLngProvided() {
        SportObjectRequestDto dto = new SportObjectRequestDto(
                "Test",
                "City",
                "Street",
                5,
                null,
                12.34,
                56.78
        );

        SportObject saved = new SportObject();
        saved.setObjectId(1);
        saved.setName("Test");
        saved.setLatitude(12.34);
        saved.setLongitude(56.78);

        when(sportObjectRepository.save(any())).thenReturn(saved);

        SportObjectResponseDto result = sportObjectService.create(dto);

        assertEquals(12.34, result.latitude());
        assertEquals(56.78, result.longitude());
    }

    // ----------------------------
    // update()
    // ----------------------------
    @Test
    void update_shouldModifyExistingObject() {
        SportObject existing = new SportObject();
        existing.setObjectId(1);
        existing.setName("Old Name");

        when(sportObjectRepository.findById(1)).thenReturn(Optional.of(existing));

        SportObjectRequestDto dto = new SportObjectRequestDto(
                "New Name",
                "City",
                "Street",
                1,
                null,
                10.0,
                20.0
        );

        when(sportObjectRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        SportObjectResponseDto result = sportObjectService.update(1, dto);

        assertEquals("New Name", result.name());
        assertEquals(10.0, result.latitude());
    }

    @Test
    void update_shouldThrowIfObjectNotFound() {
        when(sportObjectRepository.findById(1)).thenReturn(Optional.empty());
        SportObjectRequestDto dto = new SportObjectRequestDto("a", "b", "c", 1, null, 1.0, 2.0);

        assertThrows(EntityNotFoundException.class, () -> sportObjectService.update(1, dto));
    }

    // ----------------------------
    // delete()
    // ----------------------------
    @Test
    void delete_shouldDeleteIfExists() {
        when(sportObjectRepository.existsById(1)).thenReturn(true);

        sportObjectService.deleteById(1);

        verify(sportObjectRepository).deleteById(1);
    }

    @Test
    void delete_shouldThrowIfNotFound() {
        when(sportObjectRepository.existsById(1)).thenReturn(false);

        assertThrows(EntityNotFoundException.class, () -> sportObjectService.deleteById(1));
    }
}
