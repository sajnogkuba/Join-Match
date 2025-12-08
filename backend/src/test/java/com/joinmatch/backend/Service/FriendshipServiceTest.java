package com.joinmatch.backend.Service;

import com.joinmatch.backend.dto.FriendRequest.FriendResponseDto;
import com.joinmatch.backend.model.Friendship;
import com.joinmatch.backend.model.User;
import com.joinmatch.backend.repository.FriendRequestRepository;
import com.joinmatch.backend.repository.FriendshipRepository;
import com.joinmatch.backend.repository.UserRepository;
import com.joinmatch.backend.service.FriendshipService;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FriendshipServiceTest {

    @Mock
    private FriendshipRepository friendshipRepository;

    @Mock
    private FriendRequestRepository friendRequestRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private FriendshipService service;

    // -------------------------------------------------------
    // getFriendsByUserId()
    // -------------------------------------------------------

    @Test
    void getFriendsByUserId_shouldThrow_whenUserNotFound() {
        when(userRepository.findById(10)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class,
                () -> service.getFriendsByUserId(10, null));
    }

    @Test
    void getFriendsByUserId_shouldReturnFriendsList() {
        User user = new User();
        user.setId(1);

        User friend1 = new User();
        friend1.setId(2);
        friend1.setName("Adam");
        friend1.setEmail("adam@test.com");

        User friend2 = new User();
        friend2.setId(3);
        friend2.setName("Bartek");
        friend2.setEmail("bartek@test.com");

        Friendship f1 = new Friendship();
        f1.setFriendshipId(100);
        f1.setUserOne(user);
        f1.setUserTwo(friend1);

        Friendship f2 = new Friendship();
        f2.setFriendshipId(101);
        f2.setUserOne(friend2);
        f2.setUserTwo(user);

        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(friendshipRepository.findByUserOneOrUserTwo(user, user))
                .thenReturn(List.of(f1, f2));

        List<FriendResponseDto> result = service.getFriendsByUserId(1, null);

        assertEquals(2, result.size());
        assertTrue(result.stream().anyMatch(f -> f.id().equals(2)));
        assertTrue(result.stream().anyMatch(f -> f.id().equals(3)));
    }

    @Test
    void getFriendsByUserId_shouldFilterByQuery() {
        User user = new User();
        user.setId(1);

        User friend1 = new User();
        friend1.setId(2);
        friend1.setName("Adam");
        friend1.setEmail("adam@test.com");

        User friend2 = new User();
        friend2.setId(3);
        friend2.setName("Bartek");
        friend2.setEmail("bartek@test.com");

        Friendship f1 = new Friendship();
        f1.setFriendshipId(100);
        f1.setUserOne(user);
        f1.setUserTwo(friend1);

        Friendship f2 = new Friendship();
        f2.setFriendshipId(101);
        f2.setUserOne(user);
        f2.setUserTwo(friend2);

        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(friendshipRepository.findByUserOneOrUserTwo(user, user))
                .thenReturn(List.of(f1, f2));

        List<FriendResponseDto> result = service.getFriendsByUserId(1, "adam");

        assertEquals(1, result.size());
        assertEquals("Adam", result.get(0).name());
    }

    // -------------------------------------------------------
    // deleteFriendship()
    // -------------------------------------------------------

    @Test
    void deleteFriendship_shouldThrow_whenNotFound() {
        when(friendshipRepository.findById(10)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class,
                () -> service.deleteFriendship(10));
    }

    @Test
    void deleteFriendship_shouldDeleteFriendshipAndRequests() {
        User u1 = new User();
        u1.setId(1);

        User u2 = new User();
        u2.setId(2);

        Friendship f = new Friendship();
        f.setFriendshipId(55);
        f.setUserOne(u1);
        f.setUserTwo(u2);

        when(friendshipRepository.findById(55)).thenReturn(Optional.of(f));

        service.deleteFriendship(55);

        verify(friendshipRepository).deleteById(55);
        verify(friendRequestRepository).deleteBySender(u1);
        verify(friendRequestRepository).deleteBySender(u2);
    }
}
