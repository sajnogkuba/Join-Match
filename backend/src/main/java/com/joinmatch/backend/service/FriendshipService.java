package com.joinmatch.backend.service;

import com.joinmatch.backend.dto.FriendRequest.FriendResponseDto;
import com.joinmatch.backend.repository.FriendRequestRepository;
import com.joinmatch.backend.repository.FriendshipRepository;
import com.joinmatch.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FriendshipService {
    private final FriendshipRepository friendshipRepository;
    private final FriendRequestRepository friendRequestRepository;
    private final UserRepository userRepository;


    public List<FriendResponseDto> getFriendsByUserId(Integer userId, String query) {
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User with id " + userId + " not found"));

        var friends = friendshipRepository.findByUserOneOrUserTwo(user, user)
                .stream()
                .map(friendship -> {
                    if (friendship.getUserOne().getId().equals(userId)) {
                        return FriendResponseDto.fromUser(friendship.getUserTwo(), friendship.getFriendshipId());
                    } else {
                        return FriendResponseDto.fromUser(friendship.getUserOne(), friendship.getFriendshipId());
                    }
                })
                .toList();

        if (query != null && !query.isBlank()) {
            String lowerQuery = query.toLowerCase();
            friends = friends.stream()
                    .filter(f ->
                            f.name().toLowerCase().contains(lowerQuery) ||
                                    f.email().toLowerCase().contains(lowerQuery)
                    )
                    .toList();
        }

        return friends;
    }

    @Transactional
    public void deleteFriendship(Integer friendshipId) {
        if (friendshipRepository.findById(friendshipId).isEmpty()) {
            throw new IllegalArgumentException("Friendship with id " + friendshipId + " not found");
        }
        var user1 = friendshipRepository.findById(friendshipId).get().getUserOne();
        var user2 = friendshipRepository.findById(friendshipId).get().getUserTwo();
        friendshipRepository.deleteById(friendshipId);
        friendRequestRepository.deleteBySender(user1);
        friendRequestRepository.deleteBySender(user2);
    }
}
