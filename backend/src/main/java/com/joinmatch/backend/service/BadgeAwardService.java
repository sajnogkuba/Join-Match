package com.joinmatch.backend.service;

import com.joinmatch.backend.model.Badge;
import com.joinmatch.backend.model.User;
import com.joinmatch.backend.model.UserBadge;
import com.joinmatch.backend.repository.BadgeRepository;
import com.joinmatch.backend.repository.UserBadgeRepository;
import com.joinmatch.backend.repository.UserEventRepository;
import com.joinmatch.backend.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BadgeAwardService {

    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final UserEventRepository userEventRepository;
    private final EventRepository eventRepository;

    public void evaluateBadgesForUser(User user) {

        List<Badge> allBadges = badgeRepository.findAll();

        List<Integer> earnedIds = userBadgeRepository.findUserBadgesByUser(user).stream()
                .map(ub -> ub.getBadge().getId())
                .toList();

        for (Badge badge : allBadges) {

            if (earnedIds.contains(badge.getId())) {
                continue;
            }

            if (doesUserMeetCondition(user.getId(), badge)) {
                awardBadge(user, badge);
            }
        }
    }

    private boolean doesUserMeetCondition(Integer userId, Badge badge) {

        String type = badge.getConditionType();

        if ("JOIN_COUNT".equals(type)) {
            int joined = userEventRepository.countJoinedEvents(userId);
            return joined >= badge.getConditionValue();
        }

        if ("CREATE_COUNT".equals(type)) {
            int created = eventRepository.countCreatedEvents(userId);
            return created >= badge.getConditionValue();
        }

        return false;
    }

    private void awardBadge(User user, Badge badge) {
        UserBadge ub = new UserBadge();
        ub.setUser(user);
        ub.setBadge(badge);
        ub.setEarnedAt(LocalDateTime.now());
        userBadgeRepository.save(ub);
    }
}
