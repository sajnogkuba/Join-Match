package com.joinmatch.backend.repository;

import com.joinmatch.backend.enums.FriendRequestStatus;
import com.joinmatch.backend.model.FriendRequest;
import com.joinmatch.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FriendRequestRepository extends JpaRepository<FriendRequest, Integer> {
    List<FriendRequest> findByReceiverAndStatus(User receiver, FriendRequestStatus status);
    List<FriendRequest> findBySender(User sender);
    List<FriendRequest> findByReceiver(User receiver);
    Optional<FriendRequest> findBySenderAndReceiver(User sender, User receiver);
}

