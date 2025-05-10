package com.joinmatch.backend.model;

import java.math.BigDecimal;

public class Event {
    private int eventId;
    private int numberOfParticipants;
    private BigDecimal cost;
    private int courtId;
    private int visibilityId;
    private String status;
    private int scoreTeam1;
    private int scoreTeam2;

    public Event(int eventId, int numberOfParticipants, BigDecimal cost, int courtId,
                 int visibilityId, String status, int scoreTeam1, int scoreTeam2) {
        this.eventId = eventId;
        this.numberOfParticipants = numberOfParticipants;
        this.cost = cost;
        this.courtId = courtId;
        this.visibilityId = visibilityId;
        this.status = status;
        this.scoreTeam1 = scoreTeam1;
        this.scoreTeam2 = scoreTeam2;
    }

    public int getEventId() {
        return eventId;
    }

    public void setEventId(int eventId) {
        this.eventId = eventId;
    }

    public int getNumberOfParticipants() {
        return numberOfParticipants;
    }

    public void setNumberOfParticipants(int numberOfParticipants) {
        this.numberOfParticipants = numberOfParticipants;
    }

    public BigDecimal getCost() {
        return cost;
    }

    public void setCost(BigDecimal cost) {
        this.cost = cost;
    }

    public int getCourtId() {
        return courtId;
    }

    public void setCourtId(int courtId) {
        this.courtId = courtId;
    }

    public int getVisibilityId() {
        return visibilityId;
    }

    public void setVisibilityId(int visibilityId) {
        this.visibilityId = visibilityId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getScoreTeam1() {
        return scoreTeam1;
    }

    public void setScoreTeam1(int scoreTeam1) {
        this.scoreTeam1 = scoreTeam1;
    }

    public int getScoreTeam2() {
        return scoreTeam2;
    }

    public void setScoreTeam2(int scoreTeam2) {
        this.scoreTeam2 = scoreTeam2;
    }
}

