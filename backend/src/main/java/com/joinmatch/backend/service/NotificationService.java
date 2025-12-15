package com.joinmatch.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.joinmatch.backend.dto.Notification.*;
import com.joinmatch.backend.enums.NotificationType;
import com.joinmatch.backend.model.*;
import com.joinmatch.backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    @Transactional
    public void sendFriendRequestNotification(User receiver, User sender, Integer requestId) {
        try {
            NotificationDataDto data = new NotificationDataDto(
                    sender.getId(),
                    sender.getName(),
                    requestId
            );
            
            String dataJson = objectMapper.writeValueAsString(data);
            
            Notification notification = Notification.builder()
                    .user(receiver)
                    .type(NotificationType.FRIEND_REQUEST)
                    .title("Nowe zaproszenie do znajomych")
                    .message(sender.getName() + " wysłał Ci zaproszenie do znajomych")
                    .data(dataJson)
                    .build();

            Notification savedNotification = notificationRepository.save(notification);
            
            // Wyślij przez WebSocket
            NotificationResponseDto responseDto = NotificationResponseDto.fromNotification(savedNotification);
            messagingTemplate.convertAndSendToUser(
                    receiver.getId().toString(),
                    "/queue/notifications",
                    responseDto
            );
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error serializing notification data", e);
        }
    }

    @Transactional
    public void sendFriendRequestAcceptedNotification(User receiver, User sender) {
        try {
            NotificationDataDto data = new NotificationDataDto(
                    sender.getId(),
                    sender.getName(),
                    null // Brak requestId dla zaakceptowanego zaproszenia
            );
            
            String dataJson = objectMapper.writeValueAsString(data);
            
            Notification notification = Notification.builder()
                    .user(receiver)
                    .type(NotificationType.FRIEND_REQUEST_ACCEPTED)
                    .title("Zaproszenie zaakceptowane")
                    .message(sender.getName() + " zaakceptował Twoje zaproszenie do znajomych")
                    .data(dataJson)
                    .build();

            Notification savedNotification = notificationRepository.save(notification);
            
            // Wyślij przez WebSocket
            NotificationResponseDto responseDto = NotificationResponseDto.fromNotification(savedNotification);
            messagingTemplate.convertAndSendToUser(
                    receiver.getId().toString(),
                    "/queue/notifications",
                    responseDto
            );
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error serializing notification data", e);
        }
    }

    @Transactional
    public void sendFriendRequestRejectedNotification(User receiver, User sender) {
        try {
            NotificationDataDto data = new NotificationDataDto(
                    sender.getId(),
                    sender.getName(),
                    null // Brak requestId dla odrzuconego zaproszenia
            );
            
            String dataJson = objectMapper.writeValueAsString(data);
            
            Notification notification = Notification.builder()
                    .user(receiver)
                    .type(NotificationType.FRIEND_REQUEST_REJECTED)
                    .title("Zaproszenie odrzucone")
                    .message(sender.getName() + " odrzucił Twoje zaproszenie do znajomych")
                    .data(dataJson)
                    .build();

            Notification savedNotification = notificationRepository.save(notification);
            
            // Wyślij przez WebSocket
            NotificationResponseDto responseDto = NotificationResponseDto.fromNotification(savedNotification);
            messagingTemplate.convertAndSendToUser(
                    receiver.getId().toString(),
                    "/queue/notifications",
                    responseDto
            );
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error serializing notification data", e);
        }
    }

    public List<NotificationResponseDto> getUserNotifications(Integer userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationResponseDto::fromNotification)
                .toList();
    }

    public Long getUnreadCount(Integer userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Integer notificationId) {
        notificationRepository.findById(notificationId)
                .ifPresent(notification -> {
                    notification.setIsRead(true);
                    notificationRepository.save(notification);
                });
    }

    public void sendTeamRequestAcceptedNotification(TeamRequest teamRequest) {
        try {
            TeamRequestNotificationDataDto data = new TeamRequestNotificationDataDto(
                    teamRequest.getTeam().getLeader().getId(),
                    teamRequest.getTeam().getId(),
                    teamRequest.getRequestId()
            );

            String dataJson = objectMapper.writeValueAsString(data);

            Notification notification = Notification.builder()
                    .user(teamRequest.getTeam().getLeader())
                    .type(NotificationType.TEAM_REQUEST_ACCEPTED)
                    .title("Prośba dołączenia do drużyny zaakceptowana")
                    .message(teamRequest.getReceiver().getName() + " zaakceptował Twoją prośbę dołączenia do drużyny " + teamRequest.getTeam().getName())
                    .data(dataJson)
                    .build();

            Notification savedNotification = notificationRepository.save(notification);

            NotificationResponseDto responseDto = NotificationResponseDto.fromNotification(savedNotification);

            messagingTemplate.convertAndSendToUser(
                    teamRequest.getTeam().getLeader().getId().toString(),
                    "/queue/notifications",
                    responseDto
            );

        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error serializing notification data", e);
        }
    }

    public void sendTeamLeftNotification(UserTeam userTeam) {
        try {
            TeamLeftNotificationDataDto data = new TeamLeftNotificationDataDto(
                    userTeam.getTeam().getLeader().getId(),
                    userTeam.getTeam().getId(),
                    userTeam.getUser().getId()
            );
            String dataJson = objectMapper.writeValueAsString(data);
            Notification notification = Notification.builder()
                    .user(userTeam.getTeam().getLeader())
                    .type(NotificationType.TEAM_LEFT)
                    .title("Członek opuścił drużynę")
                    .message(userTeam.getUser().getName() + " opuścił drużynę " + userTeam.getTeam().getName())
                    .data(dataJson)
                    .build();

            Notification savedNotification = notificationRepository.save(notification);

            NotificationResponseDto responseDto = NotificationResponseDto.fromNotification(savedNotification);

            messagingTemplate.convertAndSendToUser(
                    userTeam.getTeam().getLeader().getId().toString(),
                    "/queue/notifications",
                    responseDto
            );
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error serializing notification data", e);
        }
    }

    public void sendTeamMemberRemovedNotification(UserTeam userTeam, String reason) {
        try {
            TeamLeftNotificationDataDto data = new TeamLeftNotificationDataDto(
                    userTeam.getTeam().getLeader().getId(),
                    userTeam.getTeam().getId(),
                    userTeam.getUser().getId()
            );
            String dataJson = objectMapper.writeValueAsString(data);
            
            String message = "Zostałeś usunięty z drużyny " + userTeam.getTeam().getName();
            if (reason != null && !reason.trim().isEmpty()) {
                message += ". Powód: " + reason;
            }
            
            Notification notification = Notification.builder()
                    .user(userTeam.getUser())
                    .type(NotificationType.TEAM_MEMBER_REMOVED)
                    .title("Zostałeś usunięty z drużyny")
                    .message(message)
                    .data(dataJson)
                    .build();

            Notification savedNotification = notificationRepository.save(notification);

            NotificationResponseDto responseDto = NotificationResponseDto.fromNotification(savedNotification);

            messagingTemplate.convertAndSendToUser(
                    userTeam.getUser().getId().toString(),
                    "/queue/notifications",
                    responseDto
            );
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error serializing notification data", e);
        }
    }

    public void sendTeamRequestNotification(TeamRequest teamRequest) {
        try {
            TeamRequestNotificationDataDto data = new TeamRequestNotificationDataDto(
                    teamRequest.getTeam().getLeader().getId(),
                    teamRequest.getTeam().getId(),
                    teamRequest.getRequestId()
            );

            String dataJson = objectMapper.writeValueAsString(data);

            Notification notification = Notification.builder()
                    .user(teamRequest.getReceiver())
                    .type(NotificationType.TEAM_REQUEST)
                    .title("Nowa prośba dołączenia do drużyny")
                    .message(teamRequest.getTeam().getLeader().getName() + " wysłał zaproszenie do drużyny " + teamRequest.getTeam().getName())
                    .data(dataJson)
                    .build();
            Notification savedNotification = notificationRepository.save(notification);
            NotificationResponseDto responseDto = NotificationResponseDto.fromNotification(savedNotification);
            messagingTemplate.convertAndSendToUser(
                    teamRequest.getReceiver().getId().toString(),
                    "/queue/notifications",
                    responseDto
            );
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error serializing notification data", e);
        }
    }

    public void sendTeamRejectAcceptedNotification(TeamRequest teamRequest) {
        try {
        TeamRequestNotificationDataDto data = new TeamRequestNotificationDataDto(
                teamRequest.getTeam().getLeader().getId(),
                teamRequest.getTeam().getId(),
                teamRequest.getRequestId()
        );

            String dataJson = objectMapper.writeValueAsString(data);
            Notification notification = Notification.builder()
                    .user(teamRequest.getTeam().getLeader())
                    .type(NotificationType.TEAM_REQUEST_REJECTED)
                    .title("Prośba dołączenia do drużyny odrzucona")
                    .message(teamRequest.getReceiver().getName() + " odrzucił Twoją prośbę dołączenia do drużyny " + teamRequest.getTeam().getName())
                    .data(dataJson)
                    .build();

            Notification savedNotification = notificationRepository.save(notification);
            NotificationResponseDto responseDto = NotificationResponseDto.fromNotification(savedNotification);
            messagingTemplate.convertAndSendToUser(
                    teamRequest.getTeam().getLeader().getId().toString(),
                    "/queue/notifications",
                    responseDto
            );

        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error serializing notification data", e);
        }
    }

    public void notifyTeamCancellation(Team team, String reason) {
        team.getUserTeams().forEach(userTeam -> {
            try {
                var user = userTeam.getUser();
                if(user == team.getLeader()) {
                    return;
                }

                TeamCancelNotificationDto data = new TeamCancelNotificationDto(
                        user.getId(),
                        team.getId(),
                        reason
                );

                String dataJson = objectMapper.writeValueAsString(data);
                String message = "Drużyna " + team.getName() + " została rozwiązana";
                if (reason != null && !reason.trim().isEmpty()) {
                    message += ". Powód: " + reason;
                }
                
                Notification notification = Notification.builder()
                        .user(user)
                        .type(NotificationType.TEAM_CANCELED)
                        .title("Drużyna została rozwiązana")
                        .message(message)
                        .data(dataJson)
                        .build();

                Notification savedNotification = notificationRepository.save(notification);
                NotificationResponseDto responseDto = NotificationResponseDto.fromNotification(savedNotification);
                messagingTemplate.convertAndSendToUser(
                        user.getId().toString(),
                        "/queue/notifications",
                        responseDto
                );

            } catch (JsonProcessingException e) {
                throw new RuntimeException("Error serializing notification data", e);
            }
        });
    }

    public void sendCommentNotifications(TeamPostComment teamPostComment) {
        try {
            PostCommentNotificationDto data = new PostCommentNotificationDto(
                    teamPostComment.getAuthor().getId(),
                    teamPostComment.getPost().getPostId(),
                    teamPostComment.getCommentId()
            );
            String dataJson = objectMapper.writeValueAsString(data);
            Notification notification = Notification.builder()
                    .user(teamPostComment.getPost().getAuthor())
                    .type(NotificationType.POST_COMMENT)
                    .title("Nowy komentarz do Twojego posta")
                    .message(teamPostComment.getAuthor().getName() + " skomentował Twój post")
                    .data(dataJson)
                    .build();
            Notification savedNotification = notificationRepository.save(notification);
            NotificationResponseDto responseDto = NotificationResponseDto.fromNotification(savedNotification);
            messagingTemplate.convertAndSendToUser(
                    teamPostComment.getPost().getAuthor().getId().toString(),
                    "/queue/notifications",
                    responseDto
            );

        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error serializing notification data", e);
        }
    }

    public void sendPostReactionNotification(TeamPostReaction reaction) {
        try {
            PostReactionNotificationDto data = new PostReactionNotificationDto(
                    reaction.getUser().getId(),
                    reaction.getPost().getPostId(),
                    reaction.getReactionType().getId()
            );
            String dataJson = objectMapper.writeValueAsString(data);
            Notification notification = Notification.builder()
                    .user(reaction.getPost().getAuthor())
                    .type(NotificationType.POST_REACTION)
                    .title("Nowa reakcja do Twojego posta")
                    .message(reaction.getUser().getName() + " zareagował na Twój post")
                    .data(dataJson)
                    .build();
            Notification savedNotification = notificationRepository.save(notification);
            NotificationResponseDto responseDto = NotificationResponseDto.fromNotification(savedNotification);
            messagingTemplate.convertAndSendToUser(
                    reaction.getPost().getAuthor().getId().toString(),
                    "/queue/notifications",
                    responseDto
            );

        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error serializing notification data", e);
        }
    }

    public void sendCommentReactionNotification(TeamPostCommentReaction reaction) {
        try {
            CommentReactionNotificationDto data = new CommentReactionNotificationDto(
                    reaction.getComment().getPost().getPostId(),
                    reaction.getComment().getCommentId(),
                    reaction.getComment().getParentComment() != null
                            ? reaction.getComment().getParentComment().getCommentId()
                            : null
            );
            String dataJson = objectMapper.writeValueAsString(data);
            Notification notification = Notification.builder()
                    .user(reaction.getComment().getAuthor())
                    .type(NotificationType.COMMENT_REACTION)
                    .title("Nowa reakcja do Twojego komentarza")
                    .message(reaction.getUser().getName() + " zareagował na Twój komentarz")
                    .data(dataJson)
                    .build();
            Notification savedNotification = notificationRepository.save(notification);
            NotificationResponseDto responseDto = NotificationResponseDto.fromNotification(savedNotification);
            messagingTemplate.convertAndSendToUser(
                    reaction.getComment().getAuthor().getId().toString(),
                    "/queue/notifications",
                    responseDto
            );

        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error serializing notification data", e);
        }
    }
    public void sendCommentReplyNotification(TeamPostComment reply) {
        try {
            if (reply.getParentComment() == null) {
                return;
            }
            
            CommentReplyNotificationDto data = new CommentReplyNotificationDto(
                    reply.getPost().getPostId(),
                    reply.getCommentId(),
                    reply.getParentComment().getCommentId()
            );
            String dataJson = objectMapper.writeValueAsString(data);
            Notification notification = Notification.builder()
                    .user(reply.getParentComment().getAuthor())
                    .type(NotificationType.COMMENT_REPLY)
                    .title("Nowa odpowiedź do Twojego komentarza")
                    .message(reply.getAuthor().getName() + " odpowiedział na Twój komentarz")
                    .data(dataJson)
                    .build();
            Notification savedNotification = notificationRepository.save(notification);
            NotificationResponseDto responseDto = NotificationResponseDto.fromNotification(savedNotification);
            messagingTemplate.convertAndSendToUser(
                    reply.getParentComment().getAuthor().getId().toString(),
                    "/queue/notifications",
                    responseDto
            );

        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error serializing notification data", e);
        }
    }
    @Transactional
    public void sendEventInvitation(User receiver, User sender, Event event) {
        try {
            EventNotificationDataDto data = new EventNotificationDataDto(
                    event.getEventId(),
                    event.getEventName(),
                    sender.getId(),
                    sender.getName()
            );

            String dataJson = objectMapper.writeValueAsString(data);

            Notification notification = Notification.builder()
                    .user(receiver)
                    .type(NotificationType.EVENT_INVITATION)
                    .title("Zaproszenie do wydarzenia")
                    .message(sender.getName() + " zaprosił Cię do wydarzenia: " + event.getEventName())
                    .data(dataJson)
                    .build();

            Notification saved = notificationRepository.save(notification);
            messagingTemplate.convertAndSendToUser(
                    receiver.getId().toString(),
                    "/queue/notifications",
                    NotificationResponseDto.fromNotification(saved)
            );

        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }
    @Transactional
    public void sendEventJoinRequest(Event event, User requester) {
        try {
            EventNotificationDataDto data = new EventNotificationDataDto(
                    event.getEventId(),
                    event.getEventName(),
                    requester.getId(),
                    requester.getName()
            );

            String json = objectMapper.writeValueAsString(data);

            Notification notification = Notification.builder()
                    .user(event.getOwner())
                    .type(NotificationType.EVENT_JOIN_REQUEST)
                    .title("Nowa prośba o dołączenie")
                    .message(requester.getName() + " chce dołączyć do wydarzenia: " + event.getEventName())
                    .data(json)
                    .build();

            Notification saved = notificationRepository.save(notification);

            messagingTemplate.convertAndSendToUser(
                    event.getOwner().getId().toString(),
                    "/queue/notifications",
                    NotificationResponseDto.fromNotification(saved)
            );
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }
    @Transactional
    public void sendEventJoinAccepted(User user, Event event) {
        try {
            EventNotificationDataDto data = new EventNotificationDataDto(
                    event.getEventId(),
                    event.getEventName(),
                    null, null
            );

            String json = objectMapper.writeValueAsString(data);

            Notification n = Notification.builder()
                    .user(user)
                    .type(NotificationType.EVENT_JOIN_ACCEPTED)
                    .title("Zgłoszenie zaakceptowane")
                    .message("Zostałeś zaakceptowany do wydarzenia: " + event.getEventName())
                    .data(json)
                    .build();

            Notification saved = notificationRepository.save(n);

            messagingTemplate.convertAndSendToUser(
                    user.getId().toString(),
                    "/queue/notifications",
                    NotificationResponseDto.fromNotification(saved)
            );

        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }
    @Transactional
    public void sendEventJoinRejected(User user, Event event) {
        try {
            EventNotificationDataDto data = new EventNotificationDataDto(
                    event.getEventId(),
                    event.getEventName(),
                    null, null
            );

            String json = objectMapper.writeValueAsString(data);

            Notification n = Notification.builder()
                    .user(user)
                    .type(NotificationType.EVENT_JOIN_REJECTED)
                    .title("Zgłoszenie odrzucone")
                    .message("Odrzucono Twoje zgłoszenie do wydarzenia: " + event.getEventName())
                    .data(json)
                    .build();

            Notification saved = notificationRepository.save(n);

            messagingTemplate.convertAndSendToUser(
                    user.getId().toString(),
                    "/queue/notifications",
                    NotificationResponseDto.fromNotification(saved)
            );

        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }
    @Transactional
    public void sendEventPublicJoined(Event event, User user) {
        try {
            EventNotificationDataDto data = new EventNotificationDataDto(
                    event.getEventId(),
                    event.getEventName(),
                    user.getId(),
                    user.getName()
            );

            String json = objectMapper.writeValueAsString(data);

            Notification n = Notification.builder()
                    .user(event.getOwner())
                    .type(NotificationType.EVENT_JOINED_PUBLIC)
                    .title("Nowy uczestnik")
                    .message(user.getName() + " dołączył do Twojego wydarzenia: " + event.getEventName())
                    .data(json)
                    .build();

            Notification saved = notificationRepository.save(n);

            messagingTemplate.convertAndSendToUser(
                    event.getOwner().getId().toString(),
                    "/queue/notifications",
                    NotificationResponseDto.fromNotification(saved)
            );
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    @Transactional
    public void sendInvitationAcceptedNotification(Event event, User user) {
        try {
            EventNotificationDataDto data = new EventNotificationDataDto(
                    event.getEventId(),
                    event.getEventName(),
                    user.getId(),
                    user.getName()
            );
            String json = objectMapper.writeValueAsString(data);

            Notification notification = Notification.builder()
                    .user(event.getOwner())
                    .type(NotificationType.EVENT_INVITATION_ACCEPTED)
                    .title("Zaproszenie przyjęte")
                    .message(user.getName() + " zaakceptował zaproszenie do wydarzenia: " + event.getEventName())
                    .data(json)
                    .build();

            Notification saved = notificationRepository.save(notification);
            messagingTemplate.convertAndSendToUser(
                    event.getOwner().getId().toString(),
                    "/queue/notifications",
                    NotificationResponseDto.fromNotification(saved)
            );
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    @Transactional
    public void sendInvitationRejectedNotification(Event event, User user) {
        try {
            EventNotificationDataDto data = new EventNotificationDataDto(
                    event.getEventId(),
                    event.getEventName(),
                    user.getId(),
                    user.getName()
            );
            String json = objectMapper.writeValueAsString(data);

            Notification notification = Notification.builder()
                    .user(event.getOwner())
                    .type(NotificationType.EVENT_INVITATION_REJECTED)
                    .title("Zaproszenie odrzucone")
                    .message(user.getName() + " odrzucił zaproszenie do wydarzenia: " + event.getEventName())
                    .data(json)
                    .build();

            Notification saved = notificationRepository.save(notification);
            messagingTemplate.convertAndSendToUser(
                    event.getOwner().getId().toString(),
                    "/queue/notifications",
                    NotificationResponseDto.fromNotification(saved)
            );
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    @Transactional
    public void sendEventCanceledNotification(Event event) {
        event.getUserEvents().forEach(ue -> {
            User user = ue.getUser();

            try {
                EventNotificationDataDto data = new EventNotificationDataDto(
                        event.getEventId(),
                        event.getEventName(),
                        event.getOwner().getId(),
                        event.getOwner().getName()
                );

                String json = objectMapper.writeValueAsString(data);

                Notification n = Notification.builder()
                        .user(user)
                        .type(NotificationType.EVENT_CANCELED)
                        .title("Wydarzenie odwołane")
                        .message("Organizator odwołał wydarzenie: " + event.getEventName())
                        .data(json)
                        .build();

                Notification saved = notificationRepository.save(n);

                messagingTemplate.convertAndSendToUser(
                        user.getId().toString(),
                        "/queue/notifications",
                        NotificationResponseDto.fromNotification(saved)
                );
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        });
    }
    @Transactional
    public void sendModeratorWarning(User receiver) {

        Notification notification = Notification.builder()
                .user(receiver)
                .type(NotificationType.MODERATOR_WARNING)
                .title("Ostrzeżenie od moderatora")
                .message("Przestrzegaj regulaminu. W przypadku dalszych naruszeń konto może zostać zablokowane.")
                .data(null)
                .build();

        Notification saved = notificationRepository.save(notification);

        messagingTemplate.convertAndSendToUser(
                receiver.getId().toString(),
                "/queue/notifications",
                NotificationResponseDto.fromNotification(saved)
        );
    }



}
