package com.joinmatch.backend.Service;

import com.joinmatch.backend.dto.Sport.*;
import com.joinmatch.backend.model.Sport;
import com.joinmatch.backend.model.SportUser;
import com.joinmatch.backend.model.User;
import com.joinmatch.backend.repository.SportRepository;
import com.joinmatch.backend.repository.SportUserRepository;
import com.joinmatch.backend.repository.UserRepository;
import com.joinmatch.backend.service.SportService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SportServiceTest {

    @Mock
    UserRepository userRepository;

    @Mock
    SportRepository sportRepository;

    @Mock
    SportUserRepository sportUserRepository;

    @InjectMocks
    SportService sportService;

    private HttpServletRequest mockRequestWithToken(String token) {
        HttpServletRequest request = mock(HttpServletRequest.class);
        Cookie cookie = new Cookie("accessToken", token);
        when(request.getCookies()).thenReturn(new Cookie[]{cookie});
        return request;
    }

    // --------------------------------------------------
    // getSportsForUser()
    // --------------------------------------------------
    @Test
    void getSportsForUser_shouldReturnMappedList() {
        User user = new User();
        user.setSportUsers(new HashSet<>());

        Sport s = new Sport();
        s.setId(5);
        s.setName("Football");
        s.setURL("football.png");

        SportUser su = new SportUser();
        su.setSport(s);
        su.setRating(8);
        su.setIsMain(true);

        user.getSportUsers().add(su);

        when(userRepository.findUserWithSportsByToken("abc"))
                .thenReturn(Optional.of(user));

        var result = sportService.getSportsForUser("abc");

        assertEquals(1, result.size());
        assertEquals(5, result.get(0).sportId());
        assertEquals(8, result.get(0).rating());
        assertTrue(result.get(0).isMain());
    }

    @Test
    void getSportsForUser_shouldThrowWhenUserNotFound() {
        when(userRepository.findUserWithSportsByToken("abc"))
                .thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class,
                () -> sportService.getSportsForUser("abc"));
    }

    // --------------------------------------------------
    // getAllSportTypes()
    // --------------------------------------------------
    @Test
    void getAllSportTypes_shouldReturnDtos() {
        Sport sport = new Sport();
        sport.setId(3);
        sport.setName("Tennis");

        when(sportRepository.findAll()).thenReturn(List.of(sport));

        var result = sportService.getAllSportTypes();

        assertEquals(1, result.size());
        assertEquals("Tennis", result.get(0).name());
    }

    // --------------------------------------------------
    // addNewSportForUser()
    // --------------------------------------------------
    @Test
    void addNewSportForUser_shouldAddSport() {
        User user = new User();
        user.setSportUsers(new HashSet<>());

        Sport sport = new Sport();
        sport.setId(10);
        sport.setSportUsers(new HashSet<>());

        when(userRepository.findByTokenValue("t")).thenReturn(Optional.of(user));
        when(sportRepository.findSportById(10)).thenReturn(Optional.of(sport));

        HttpServletRequest request = mockRequestWithToken("t");
        sportService.addNewSportForUser(10, 7, request);

        assertEquals(1, user.getSportUsers().size());
        SportUser su = user.getSportUsers().iterator().next();

        assertEquals(7, su.getRating());
        assertTrue(su.getIsMain()); // pierwsza dyscyplina jest main
    }

    @Test
    void addNewSportForUser_shouldThrowWhenUserNotFound() {
        when(userRepository.findByTokenValue("t")).thenReturn(Optional.empty());

        HttpServletRequest request = mockRequestWithToken("t");
        assertThrows(IllegalArgumentException.class,
                () -> sportService.addNewSportForUser(1, 5, request));
    }

    @Test
    void addNewSportForUser_shouldThrowWhenSportNotFound() {
        when(userRepository.findByTokenValue("t"))
                .thenReturn(Optional.of(new User()));

        when(sportRepository.findSportById(99)).thenReturn(Optional.empty());

        HttpServletRequest request = mockRequestWithToken("t");
        assertThrows(IllegalArgumentException.class,
                () -> sportService.addNewSportForUser(99, 5, request));
    }

    @Test
    void addNewSportForUser_shouldRejectIfSportAlreadyExists() {
        User user = new User();
        Sport sport = new Sport();
        sport.setId(10);

        SportUser su = new SportUser();
        su.setSport(sport);
        su.setRating(5);

        user.setSportUsers(Set.of(su));

        when(userRepository.findByTokenValue("t")).thenReturn(Optional.of(user));
        when(sportRepository.findSportById(10)).thenReturn(Optional.of(sport));

        HttpServletRequest request = mockRequestWithToken("t");
        assertThrows(IllegalArgumentException.class,
                () -> sportService.addNewSportForUser(10, 7, request));
    }

    // --------------------------------------------------
    // setMainSport()
    // --------------------------------------------------
    @Test
    void setMainSport_shouldSwitchMainSport() {
        User user = new User();
        user.setId(1);

        Sport s1 = new Sport(); s1.setId(10);
        Sport s2 = new Sport(); s2.setId(11);

        SportUser su1 = new SportUser();
        su1.setIsMain(true);
        su1.setSport(s1);

        SportUser su2 = new SportUser();
        su2.setIsMain(false);
        su2.setSport(s2);

        user.setSportUsers(Set.of(su1, su2));

        when(userRepository.findByEmail("a@a.com"))
                .thenReturn(Optional.of(user));

        when(sportUserRepository.findByUserIdAndSportId(1, 11))
                .thenReturn(Optional.of(su2));

        sportService.setMainSport("a@a.com", 11);

        assertFalse(su1.getIsMain());
        assertTrue(su2.getIsMain());
    }

    @Test
    void setMainSport_shouldThrowIfUserNotFound() {
        when(userRepository.findByEmail("x")).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class,
                () -> sportService.setMainSport("x", 10));
    }

    @Test
    void setMainSport_shouldThrowIfSportNotAssigned() {
        User user = new User();
        user.setId(2);
        user.setSportUsers(new HashSet<>());

        when(userRepository.findByEmail("x")).thenReturn(Optional.of(user));
        when(sportUserRepository.findByUserIdAndSportId(2, 10))
                .thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class,
                () -> sportService.setMainSport("x", 10));
    }

    // --------------------------------------------------
    // removeSport()
    // --------------------------------------------------
    @Test
    void removeSport_shouldRemoveSport() {
        User user = new User();
        user.setId(1);
        user.setSportUsers(new HashSet<>());

        Sport sport = new Sport();
        sport.setId(10);
        sport.setSportUsers(new HashSet<>());

        SportUser su = new SportUser();
        su.setUser(user);
        su.setSport(sport);
        su.setIsMain(false);

        user.getSportUsers().add(su);
        sport.getSportUsers().add(su);

        RemoveSportDto dto = new RemoveSportDto(10);

        when(userRepository.findByTokenValue("t")).thenReturn(Optional.of(user));
        when(sportUserRepository.findByUserIdAndSportId(1, 10)).thenReturn(Optional.of(su));
        when(sportRepository.findSportById(10)).thenReturn(Optional.of(sport));

        HttpServletRequest request = mockRequestWithToken("t");
        sportService.removeSport(dto, request);

        assertTrue(user.getSportUsers().isEmpty());
        assertTrue(sport.getSportUsers().isEmpty());
        verify(sportUserRepository).delete(su);
    }

    @Test
    void removeSport_shouldThrowIfMainSport() {
        User user = new User();
        user.setId(1);

        SportUser su = new SportUser();
        su.setIsMain(true);

        when(userRepository.findByTokenValue("t")).thenReturn(Optional.of(user));
        when(sportUserRepository.findByUserIdAndSportId(1, 10))
                .thenReturn(Optional.of(su));

        HttpServletRequest request = mockRequestWithToken("t");
        assertThrows(IllegalArgumentException.class,
                () -> sportService.removeSport(new RemoveSportDto(10), request));
    }

    @Test
    void removeSport_shouldThrowIfNotAssigned() {
        User user = new User();
        user.setId(1); // ← KLUCZOWE

        when(userRepository.findByTokenValue("t"))
                .thenReturn(Optional.of(user));

        when(sportUserRepository.findByUserIdAndSportId(anyInt(), anyInt()))
                .thenReturn(Optional.empty());

        HttpServletRequest request = mockRequestWithToken("t");
        assertThrows(IllegalArgumentException.class,
                () -> sportService.removeSport(new RemoveSportDto(10), request));
    }


    // --------------------------------------------------
    // addNewSport()
    // --------------------------------------------------
    @Test
    void addNewSport_shouldSaveSport() {
        SportDto dto = new SportDto(null,"Padel", "img.png");

        sportService.addNewSport(dto);

        verify(sportRepository).save(any(Sport.class));
    }

    // --------------------------------------------------
    // renameSport()
    // --------------------------------------------------
    @Test
    void renameSport_shouldChangeName() {
        Sport sport = new Sport();
        sport.setId(5);
        sport.setName("Old");

        ChangeNameOfSportDto dto = new ChangeNameOfSportDto(5, "New");

        when(sportRepository.findSportById(5))
                .thenReturn(Optional.of(sport));

        sportService.renameSport(dto);

        assertEquals("New", sport.getName());
        verify(sportRepository).save(sport);
    }

    // --------------------------------------------------
    // deleteSport()
    // --------------------------------------------------
    @Test
    void deleteSport_shouldDeleteWhenNoLinks() {
        Sport sport = new Sport();
        sport.setId(3);
        sport.setSportUsers(Collections.emptySet());
        sport.setEvents(Collections.emptySet());

        when(sportRepository.findSportById(3))
                .thenReturn(Optional.of(sport));

        sportService.deleteSport(3);

        verify(sportRepository).delete(sport);
    }

    @Test
    void deleteSport_shouldThrowIfHasLinks() {
        Sport sport = new Sport();
        sport.setSportUsers(Set.of(new SportUser())); // ma powiązania

        when(sportRepository.findSportById(3))
                .thenReturn(Optional.of(sport));

        assertThrows(RuntimeException.class,
                () -> sportService.deleteSport(3));
    }
}
