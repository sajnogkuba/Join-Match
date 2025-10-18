package com.joinmatch.backend.service;

import com.joinmatch.backend.dto.FriendRequestDto;
import com.joinmatch.backend.dto.FriendRequestResponseDto;
import com.joinmatch.backend.enums.FriendRequestStatus;
import com.joinmatch.backend.model.FriendRequest;
import com.joinmatch.backend.model.User;
import com.joinmatch.backend.repository.FriendRequestRepository;
import com.joinmatch.backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FriendRequestService {

    private final FriendRequestRepository friendRequestRepository;
    private final UserRepository userRepository;

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
        return new FriendRequestResponseDto(
                saved.getRequestId(),
                saved.getSender().getId(),
                saved.getReceiver().getId(),
                saved.getStatus().name(),
                saved.getCreatedAt(),
                saved.getUpdatedAt()
        );
    }
}