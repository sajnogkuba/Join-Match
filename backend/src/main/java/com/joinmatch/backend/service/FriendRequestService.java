package com.joinmatch.backend.service;

import com.joinmatch.backend.dto.FriendRequestDto;
import com.joinmatch.backend.dto.FriendRequestResponseDto;
import com.joinmatch.backend.enums.FriendRequestStatus;
import com.joinmatch.backend.model.FriendRequest;
import com.joinmatch.backend.model.Friendship;
import com.joinmatch.backend.model.User;
import com.joinmatch.backend.repository.FriendRequestRepository;
import com.joinmatch.backend.repository.FriendshipRepository;
import com.joinmatch.backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FriendRequestService {

    private final FriendRequestRepository friendRequestRepository;
    private final UserRepository userRepository;
    private final FriendshipRepository friendshipRepository;
    private final NotificationService notificationService;

    @Transactional
    public FriendRequestResponseDto sendRequest(FriendRequestDto requestDto) {
        Integer senderId = requestDto.senderId();
        Integer receiverId = requestDto.receiverId();

        if (senderId.equals(receiverId)) {
            throw new IllegalArgumentException("Nie możesz wysłać zaproszenia do samego siebie.");
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new EntityNotFoundException("Nie znaleziono nadawcy o ID " + senderId));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new EntityNotFoundException("Nie znaleziono odbiorcy o ID " + receiverId));

        boolean alreadyExists = friendRequestRepository
                .findBySenderAndReceiver(sender, receiver)
                .isPresent();

        if (alreadyExists) {
            throw new IllegalStateException("Zaproszenie już istnieje.");
        }

        FriendRequest friendRequest = FriendRequest.builder()
                .sender(sender)
                .receiver(receiver)
                .status(FriendRequestStatus.PENDING)
                .build();

        FriendRequest saved = friendRequestRepository.save(friendRequest);

        notificationService.sendFriendRequestNotification(receiver, sender, saved.getRequestId());
        
        return FriendRequestResponseDto.fromFriendRequest(saved);
    }

    public List<FriendRequestResponseDto> getPendingRequestByReceiverId(Integer receiverId) {
        var sender = userRepository.findById(receiverId)
                .orElseThrow(() -> new EntityNotFoundException("User not found for id: " + receiverId));

        return friendRequestRepository.findByReceiver(sender)
                .stream()
                .filter(fr -> fr.getStatus() == FriendRequestStatus.PENDING)
                .map(FriendRequestResponseDto::fromFriendRequest)
                .toList();
    }

    @Transactional
    public void deleteRequest(Integer requestId) {
        if (friendRequestRepository.findById(requestId).isEmpty()) {
            throw new EntityNotFoundException("FriendRequest with id " + requestId + " not found");
        }
        FriendRequest request = friendRequestRepository.findById(requestId).get();
        notificationService.sendFriendRequestRejectedNotification(request.getSender(), request.getReceiver());
        friendRequestRepository.deleteById(requestId);
    }

    @Transactional
    public void acceptRequest(Integer requestId) {
        if (friendRequestRepository.findById(requestId).isEmpty()) {
            throw new EntityNotFoundException("FriendRequest with id " + requestId + " not found");
        }
        FriendRequest request = friendRequestRepository.findById(requestId).get();
        request.setStatus(FriendRequestStatus.ACCEPTED);
        friendRequestRepository.save(request);
        Friendship friendship = new Friendship();
        friendship.setUserOne(request.getSender());
        friendship.setUserTwo(request.getReceiver());
        friendshipRepository.save(friendship);
        notificationService.sendFriendRequestAcceptedNotification(request.getSender(), request.getReceiver());
    }
}