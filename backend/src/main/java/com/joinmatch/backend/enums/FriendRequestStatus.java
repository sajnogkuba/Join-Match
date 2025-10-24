package com.joinmatch.backend.enums;

public enum FriendRequestStatus {
    PENDING,
    ACCEPTED,
    REJECTED;

    public static FriendRequestStatus getStatusFromString(String status) {
        for (FriendRequestStatus frs : FriendRequestStatus.values()) {
            if (frs.name().equalsIgnoreCase(status)) {
                return frs;
            }
        }
        throw new IllegalArgumentException("No enum constant for status: " + status);
    }
}