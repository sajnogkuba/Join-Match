package com.joinmatch.backend.Service;

import com.joinmatch.backend.dto.FriendRequest.FriendRequestRequestDto;
import com.joinmatch.backend.dto.FriendRequest.FriendRequestResponseDto;
import com.joinmatch.backend.enums.FriendRequestStatus;
import com.joinmatch.backend.model.FriendRequest;
import com.joinmatch.backend.model.Friendship;
import com.joinmatch.backend.model.User;
import com.joinmatch.backend.repository.FriendRequestRepository;
import com.joinmatch.backend.repository.FriendshipRepository;
import com.joinmatch.backend.repository.UserRepository;
import com.joinmatch.backend.service.FriendRequestService;
import com.joinmatch.backend.service.NotificationService;
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
class FriendRequestServiceTest {

    @Mock
    private FriendRequestRepository friendRequestRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private FriendshipRepository friendshipRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private FriendRequestService service;


    // -------------------------------------------------------
    // sendRequest()
    // -------------------------------------------------------

    @Test
    void sendRequest_shouldThrow_whenSenderEqualsReceiver() {
        var dto = new FriendRequestRequestDto(5, 5);

        assertThrows(IllegalArgumentException.class,
                () -> service.sendRequest(dto));
    }

    @Test
    void sendRequest_shouldThrow_whenSenderNotFound() {
        var dto = new FriendRequestRequestDto(1, 2);

        when(userRepository.findById(1)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class,
                () -> service.sendRequest(dto));
    }

    @Test
    void sendRequest_shouldThrow_whenReceiverNotFound() {
        var dto = new FriendRequestRequestDto(1, 2);

        when(userRepository.findById(1)).thenReturn(Optional.of(new User()));
        when(userRepository.findById(2)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class,
                () -> service.sendRequest(dto));
    }

    @Test
    void sendRequest_shouldThrow_whenRequestAlreadyExists() {
        var dto = new FriendRequestRequestDto(1, 2);

        User sender = new User();
        User receiver = new User();

        when(userRepository.findById(1)).thenReturn(Optional.of(sender));
        when(userRepository.findById(2)).thenReturn(Optional.of(receiver));
        when(friendRequestRepository.findBySenderAndReceiver(sender, receiver))
                .thenReturn(Optional.of(new FriendRequest()));

        assertThrows(IllegalStateException.class,
                () -> service.sendRequest(dto));
    }

    @Test
    void sendRequest_shouldSaveAndReturnDto() {
        var dto = new FriendRequestRequestDto(1, 2);

        User sender = new User();
        sender.setId(1);
        User receiver = new User();
        receiver.setId(2);

        FriendRequest saved = FriendRequest.builder()
                .requestId(99)
                .sender(sender)
                .receiver(receiver)
                .status(FriendRequestStatus.PENDING)
                .build();

        when(userRepository.findById(1)).thenReturn(Optional.of(sender));
        when(userRepository.findById(2)).thenReturn(Optional.of(receiver));
        when(friendRequestRepository.findBySenderAndReceiver(sender, receiver))
                .thenReturn(Optional.empty());
        when(friendRequestRepository.save(any(FriendRequest.class))).thenReturn(saved);

        FriendRequestResponseDto result = service.sendRequest(dto);

        assertEquals(99, result.requestId());
        assertEquals(FriendRequestStatus.PENDING.name(), result.status());

        verify(notificationService).sendFriendRequestNotification(receiver, sender, 99);
    }


    // -------------------------------------------------------
    // getPendingRequestByReceiverId()
    // -------------------------------------------------------

    @Test
    void getPendingRequestByReceiverId_shouldThrow_whenUserNotFound() {
        when(userRepository.findById(10)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class,
                () -> service.getPendingRequestByReceiverId(10));
    }

    @Test
    void getPendingRequestByReceiverId_shouldReturnOnlyPending() {
        User receiver = new User();
        receiver.setId(10);

        User sender1 = new User();
        sender1.setId(100);

        User sender2 = new User();
        sender2.setId(200);

        FriendRequest pending = FriendRequest.builder()
                .requestId(1)
                .sender(sender1)
                .receiver(receiver)
                .status(FriendRequestStatus.PENDING)
                .build();

        FriendRequest accepted = FriendRequest.builder()
                .requestId(2)
                .sender(sender2)
                .receiver(receiver)
                .status(FriendRequestStatus.ACCEPTED)
                .build();

        when(userRepository.findById(10)).thenReturn(Optional.of(receiver));
        when(friendRequestRepository.findByReceiver(receiver))
                .thenReturn(List.of(pending, accepted));

        var result = service.getPendingRequestByReceiverId(10);

        assertEquals(1, result.size());
        assertEquals(1, result.get(0).requestId());
        assertEquals(FriendRequestStatus.PENDING.name(), result.get(0).status());
    }


    // -------------------------------------------------------
    // deleteRequest()
    // -------------------------------------------------------

    @Test
    void deleteRequest_shouldThrow_whenNotFound() {
        when(friendRequestRepository.findById(15)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class,
                () -> service.deleteRequest(15));
    }

    @Test
    void deleteRequest_shouldDeleteAndNotify() {
        User sender = new User();
        User receiver = new User();

        FriendRequest req = FriendRequest.builder()
                .requestId(22)
                .sender(sender)
                .receiver(receiver)
                .build();

        when(friendRequestRepository.findById(22)).thenReturn(Optional.of(req));

        service.deleteRequest(22);

        verify(notificationService).sendFriendRequestRejectedNotification(sender, receiver);
        verify(friendRequestRepository).deleteById(22);
    }


    // -------------------------------------------------------
    // acceptRequest()
    // -------------------------------------------------------

    @Test
    void acceptRequest_shouldThrow_whenNotFound() {
        when(friendRequestRepository.findById(33)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class,
                () -> service.acceptRequest(33));
    }

    @Test
    void acceptRequest_shouldAcceptFriendshipAndNotify() {
        User sender = new User();
        sender.setId(1);
        User receiver = new User();
        receiver.setId(2);

        FriendRequest req = FriendRequest.builder()
                .requestId(55)
                .sender(sender)
                .receiver(receiver)
                .status(FriendRequestStatus.PENDING)
                .build();

        when(friendRequestRepository.findById(55)).thenReturn(Optional.of(req));

        service.acceptRequest(55);

        assertEquals(FriendRequestStatus.ACCEPTED, req.getStatus());
        verify(friendRequestRepository).save(req);
        verify(friendshipRepository).save(any(Friendship.class));
        verify(notificationService).sendFriendRequestAcceptedNotification(sender, receiver);
    }
}
