package com.joinmatch.backend.service;

import com.joinmatch.backend.config.JwtService;
import com.joinmatch.backend.dto.*;
import com.joinmatch.backend.dto.Auth.LoginRequest;
import com.joinmatch.backend.dto.Auth.RegisterRequest;
import com.joinmatch.backend.dto.ChangePass.ChangePassDto;
import com.joinmatch.backend.dto.Moderator.GetUsersDto;
import com.joinmatch.backend.enums.FriendRequestStatus;
import com.joinmatch.backend.model.JoinMatchToken;
import com.joinmatch.backend.model.Role;
import com.joinmatch.backend.model.User;
import com.joinmatch.backend.repository.FriendRequestRepository;
import com.joinmatch.backend.repository.FriendshipRepository;
import com.joinmatch.backend.repository.JoinMatchTokenRepository;
import com.joinmatch.backend.repository.UserRepository;
import com.joinmatch.backend.supportObject.RefreshSupportObject;
import com.joinmatch.backend.supportObject.TokenSupportObject;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Pageable;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@AllArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final FriendRequestRepository friendRequestRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final JoinMatchTokenRepository joinMatchTokenRepository;
    private final FriendshipRepository friendshipRepository;


    public void register(RegisterRequest request) {
        // Sprawdź, czy email już istnieje
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new RuntimeException("User already exists");
        }
        User user = new User();
        user.setName(request.name());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setDateOfBirth(LocalDate.parse(request.dateOfBirth()));
        user.setRole(Role.USER);
        user.setIsBlocked(false);
        userRepository.save(user);
        // Można dodać logikę wysyłania e-maila weryfikacyjnego
    }

    public TokenSupportObject login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        if (user.getIsBlocked()) {
            throw new IllegalArgumentException("User is blocked");
        }
        return generateAndSaveTokens(user);
    }

    public RefreshSupportObject refreshToken(String refreshToken) {
        Optional<List<JoinMatchToken>> joinMatchTokenByRefreshToken = joinMatchTokenRepository.getJoinMatchTokenByRefreshToken(refreshToken);
        if (joinMatchTokenByRefreshToken.isEmpty()) {
            throw new RuntimeException("Wrong refresh token");
        }
        List<JoinMatchToken> joinMatchTokens = joinMatchTokenByRefreshToken.get();
        JoinMatchToken joinMatchToken = null;
        for (int i = 0; i < joinMatchTokens.size(); i++) {
            if (LocalDateTime.now().isBefore(joinMatchTokens.get(i).getExpireDate()) && (!joinMatchTokens.get(i).getRevoked())) {
                joinMatchToken = joinMatchTokens.get(i);
            }
        }
        if (joinMatchToken == null) {
            throw new RuntimeException("You have to login");
        }
        joinMatchToken.setRevoked(true);
        User user = joinMatchToken.getUser();
        return new RefreshSupportObject(user, generateAndSaveTokens(user));
    }

    public void logoutUser(String email) {
        Optional<User> byEmail = userRepository.findByEmail(email);
        if (byEmail.isEmpty()) {
            throw new RuntimeException("Nie ma takiego usera");
        }
        User user = byEmail.get();
        for (int i = 0; i < user.getTokens().size(); i++) {
            if (!user.getTokens().get(i).getRevoked()) {
                user.getTokens().get(i).setRevoked(true);
            }
        }
        userRepository.save(user);

    }

    private TokenSupportObject generateAndSaveTokens(User user) {
        String token = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        TokenSupportObject supportObject = new TokenSupportObject(token, refreshToken);
        JoinMatchToken joinMatchToken = new JoinMatchToken();
        joinMatchToken.setToken(token);
        joinMatchToken.setRefreshToken(refreshToken);
        joinMatchToken.setUser(user);
        joinMatchToken.setRevoked(false);
        joinMatchToken.setExpireDate(LocalDateTime.now().plusHours(JwtService.REFRESH_TOKEN_EXP_HOURS));
        joinMatchTokenRepository.save(joinMatchToken);
        return supportObject;
    }

    public TokenSupportObject issueTokensFor(User user) {
        return generateAndSaveTokens(user);
    }

    @Transactional
    public void changePassword(ChangePassDto changePassDto) {
        Optional<User> byTokenValue = userRepository.findByTokenValue(changePassDto.token());
        if (!byTokenValue.isPresent()) {
            throw new IllegalArgumentException("No users found");
        }
        User user = byTokenValue.get();
        System.out.println(passwordEncoder.matches(changePassDto.oldPassword(), user.getPassword()));
        if (!passwordEncoder.matches(changePassDto.oldPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        user.setPassword(passwordEncoder.encode(changePassDto.newPassword()));
        userRepository.save(user);
    }

    public UserResponseDto getSimpleInfo(String token) {
        Optional<User> byTokenValue = userRepository.findByTokenValue(token);
        if (byTokenValue.isEmpty()) {
            throw new IllegalArgumentException("User Not Found");
        }
        User user = byTokenValue.get();
        return UserResponseDto.fromUser(user);
    }

    public void updateUserPhoto(String token, String photoUrl) {
        Optional<User> byTokenValue = userRepository.findByTokenValue(token);
        if (byTokenValue.isEmpty()) {
            throw new IllegalArgumentException("User Not Found");
        }
        User user = byTokenValue.get();
        user.setUrlOfPicture(photoUrl);
        userRepository.save(user);
    }

    public List<SearchResponseDto> searchUsers(String query, Integer senderId) {
        var users = userRepository.searchByNameOrEmail(query)
                .stream()
                .map(UserResponseDto::fromUser)
                .toList();

        var sender = userRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("Sender with id " + senderId + " not found"));
        var requestsSent = friendRequestRepository.findBySender(sender);
        var requestsReceived = friendRequestRepository.findByReceiver(sender);
        var friendships = friendshipRepository.findByUserOneOrUserTwo(sender, sender);

        List<SearchResponseDto> searchResults = new ArrayList<>();

        for (UserResponseDto userDto : users) {
            if (Objects.equals(userDto.id(), senderId)) continue;
            boolean isFriend = friendships.stream().anyMatch(f ->
                    (Objects.equals(f.getUserOne().getId(), userDto.id()) ||
                            Objects.equals(f.getUserTwo().getId(), userDto.id()))
            );
            if (isFriend) continue;

            FriendRequestStatus status = null;
            var sentRequest = requestsSent.stream()
                    .filter(req -> req.getReceiver().getEmail().equals(userDto.email()))
                    .findFirst();
            var receivedRequest = requestsReceived.stream()
                    .filter(req -> req.getSender().getEmail().equals(userDto.email()))
                    .findFirst();

            if (sentRequest.isPresent()) {
                status = sentRequest.get().getStatus();
            } else if (receivedRequest.isPresent()) {
                status = receivedRequest.get().getStatus();
            }

            searchResults.add(new SearchResponseDto(
                    userDto.id(),
                    userDto.name(),
                    userDto.email(),
                    status,
                    userDto.urlOfPicture()
            ));
        }

        return searchResults;
    }

    public UsersResponseDto getUserById(Integer id, Integer viewerId) {
        User targetUser = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<UsersResponseDto.SportInfo> sports = targetUser.getSportUsers()
                .stream()
                .map(su -> new UsersResponseDto.SportInfo(
                        su.getSport().getId(),
                        su.getSport().getName(),
                        su.getRating().toString()
                ))
                .toList();

        var friendships = friendshipRepository.findByUserOneOrUserTwo(targetUser, targetUser);

        List<UsersResponseDto.FriendInfo> friends = friendships.stream()
                .map(f -> {
                    User friend = f.getUserOne().equals(targetUser) ? f.getUserTwo() : f.getUserOne();
                    return new UsersResponseDto.FriendInfo(
                            friend.getId(),
                            friend.getName(),
                            friend.getEmail(),
                            friend.getUrlOfPicture()
                    );
                })
                .toList();

        String relationStatus = "NONE";

        if (viewerId != null && !viewerId.equals(id)) {
            var viewer = userRepository.findById(viewerId).orElse(null);

            if (viewer != null) {
                boolean areFriends = friendshipRepository.existsByUserOneAndUserTwo(viewer, targetUser)
                        || friendshipRepository.existsByUserOneAndUserTwo(targetUser, viewer);

                if (areFriends) relationStatus = "FRIEND";
                else {
                    boolean pending = friendRequestRepository.findBySenderAndReceiver(viewer, targetUser)
                            .filter(fr -> fr.getStatus() == FriendRequestStatus.PENDING)
                            .isPresent()
                            || friendRequestRepository.findBySenderAndReceiver(targetUser, viewer)
                            .filter(fr -> fr.getStatus() == FriendRequestStatus.PENDING)
                            .isPresent();

                    if (pending) relationStatus = "PENDING";
                }
            }
        }


        return new UsersResponseDto(
                targetUser.getId(),
                targetUser.getName(),
                targetUser.getEmail(),
                targetUser.getDateOfBirth(),
                targetUser.getUrlOfPicture(),
                sports,
                friends,
                relationStatus
        );
    }

    public void changeStatusOfBlock(String email, boolean endStateOfBlocking) {
        User user = userRepository.findByEmail(email).orElseThrow(IllegalArgumentException::new);
        if (user.getIsBlocked() && endStateOfBlocking) {
            throw new RuntimeException();
        }
        user.setIsBlocked(endStateOfBlocking);
        userRepository.save(user);
    }

    public Page<GetUsersDto> getUsersForModeration(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(this::toUserDto);
    }

    private GetUsersDto toUserDto(User user) {
        return new GetUsersDto(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getIsBlocked()
        );
    }
}
