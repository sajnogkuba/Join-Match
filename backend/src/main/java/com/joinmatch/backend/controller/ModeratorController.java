package com.joinmatch.backend.controller;

import com.joinmatch.backend.dto.Moderator.*;
import com.joinmatch.backend.service.ModeratorService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/moderator")
@RequiredArgsConstructor
public class ModeratorController {
    private final ModeratorService moderatorService;

    @GetMapping("/auth/me")
    public ResponseEntity<Boolean> getModeratorPage(HttpServletRequest httpServletRequest){
        try {
            moderatorService.authenticate(httpServletRequest);
        }catch (IllegalArgumentException exception){
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(false);
        }
        return ResponseEntity.ok(true);
    }
    @GetMapping("/dashboard")
    public ResponseEntity<GetStatisticsForDashboard> getStatisticsForDashboardResponseEntity(){
        GetStatisticsForDashboard statisticsForDashboard = moderatorService.getStatisticsForDashboard();
        return ResponseEntity.ok(statisticsForDashboard);
    }
   @GetMapping("/reportEvents")
    public Page<ModeratorEventReportListItemDto> getEventReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return moderatorService.getEventReports(page, size);
    }
    @PatchMapping("/reportEvent/{idReportEvent}/accept")
    public ResponseEntity<Void> acceptReportEvent(@PathVariable Integer idReportEvent){
        try{
            moderatorService.acceptReportEvent(idReportEvent);
        }catch (IllegalArgumentException e){
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok().build();
    }
    @PatchMapping("/reportEvent/{idReportEvent}/reject")
    public ResponseEntity<Void> rejectReportEvent(@PathVariable Integer idReportEvent){
        try{
            moderatorService.rejectReportEvent(idReportEvent);
        }catch (IllegalArgumentException e){
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok().build();
    }
    @PatchMapping("/reportEvent/{idReportEvent}/toggle-viewed")
    public ResponseEntity<Void> markAsViewedReportEvent(@PathVariable Integer idReportEvent){
        try{
            moderatorService.markAsViewedReportEvent(idReportEvent);
        }catch (IllegalArgumentException e){
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok().build();
    }
    @PatchMapping("/reportEvent/{idReportEvent}/toggle-unviewed")
    public ResponseEntity<Void> markAsUnviewedReportEvent(@PathVariable Integer idReportEvent){
        try{
            moderatorService.markAsUnviewedReportEvent(idReportEvent);
        }catch (IllegalArgumentException e){
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok().build();
    }
    @DeleteMapping("reportEvent/{idReportEvent}/delete")
    public ResponseEntity<Void> deleteReportEvent(@PathVariable Integer idReportEvent){
        try{
            moderatorService.deleteReportEvent(idReportEvent);
        }catch (IllegalArgumentException e){
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok().build();
    }
    @GetMapping("/reportEventRatings")
    public Page<ModeratorEventRatingReportListItemDto> getEventRatingReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return moderatorService.getEventRatingReports(page, size);
    }
    @PatchMapping("/reportEventRating/{idReportEventRating}/accept")
    public ResponseEntity<Void> acceptReportEventRating(@PathVariable Integer idReportEventRating){
        try{
            moderatorService.acceptReportEventRating(idReportEventRating);
        }catch (IllegalArgumentException e){
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok().build();
    }
    @PatchMapping("/reportEventRating/{idReportEventRating}/reject")
    public ResponseEntity<Void> rejectReportEventRating(@PathVariable Integer idReportEventRating){
        try{
            moderatorService.rejectReportEventRating(idReportEventRating);
        }catch (IllegalArgumentException e){
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok().build();
    }
    @PatchMapping("/reportEventRating/{idReportEventRating}/toggle-viewed")
    public ResponseEntity<Void> markAsViewedReportEventRating(@PathVariable Integer idReportEventRating){
        try{
            moderatorService.markAsViewedReportEventRating(idReportEventRating);
        }catch (IllegalArgumentException e){
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok().build();
    }
    @PatchMapping("/reportEventRating/{idReportEventRating}/toggle-unviewed")
    public ResponseEntity<Void> markAsUnviewedReportEventRating(@PathVariable Integer idReportEventRating){
        try{
            moderatorService.markAsUnviewedReportEventRating(idReportEventRating);
        }catch (IllegalArgumentException e){
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok().build();
    }
    @DeleteMapping("reportEventRating/{idReportEventRating}/delete")
    public ResponseEntity<Void> deleteReportEventRating(@PathVariable Integer idReportEventRating){
        try{
            moderatorService.deleteReportEventRating(idReportEventRating);
        }catch (IllegalArgumentException e){
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok().build();
    }
    @GetMapping("/reportUserRatings")
    public Page<UserRateReportDto> getUserRatingReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return moderatorService.getUserRatingReports(page, size);
    }
    @PatchMapping("/reportUserRating/{idReportUserRating}/accept")
    public ResponseEntity<Void> acceptReportUserRating(@PathVariable Integer idReportUserRating){
        try{
            moderatorService.acceptReportUserRating(idReportUserRating);
        }catch (IllegalArgumentException e){
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok().build();
    }
    @PatchMapping("/reportUserRating/{idReportUserRating}/reject")
    public ResponseEntity<Void> rejectReportUserRating(@PathVariable Integer idReportUserRating){
        try{
            moderatorService.rejectReportUserRating(idReportUserRating);
        }catch (IllegalArgumentException e){
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok().build();
    }
    @PatchMapping("/reportUserRating/{idReportUserRating}/toggle-viewed")
    public ResponseEntity<Void> markAsViewedReportUserRating(@PathVariable Integer idReportUserRating){
        try{
            moderatorService.markAsViewedReportUserRating(idReportUserRating);
        }catch (IllegalArgumentException e){
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok().build();
    }
    @PatchMapping("/reportUserRating/{idReportUserRating}/toggle-unviewed")
    public ResponseEntity<Void> markAsUnviewedReportUserRating(@PathVariable Integer idReportUserRating){
        try{
            moderatorService.markAsUnviewedReportUserRating(idReportUserRating);
        }catch (IllegalArgumentException e){
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok().build();
    }
    @DeleteMapping("reportUserRating/{idReportUserRating}/delete")
    public ResponseEntity<Void> deleteReportUserRating(@PathVariable Integer idReportUserRating){
        try{
            moderatorService.deleteReportUserRating(idReportUserRating);
        }catch (IllegalArgumentException e){
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok().build();
    }
    @GetMapping("/reportTeams")
    public Page<ModeratorTeamReportDto> getTeamReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return moderatorService.getTeamReports(page, size);
    }

    @PatchMapping("/reportTeam/{idReportTeam}/accept")
    public ResponseEntity<Void> acceptReportTeam(@PathVariable Integer idReportTeam) {
        try {
            moderatorService.acceptReportTeam(idReportTeam);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/reportTeam/{idReportTeam}/reject")
    public ResponseEntity<Void> rejectReportTeam(@PathVariable Integer idReportTeam) {
        try {
            moderatorService.rejectReportTeam(idReportTeam);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/reportTeam/{idReportTeam}/toggle-viewed")
    public ResponseEntity<Void> markAsViewedReportTeam(@PathVariable Integer idReportTeam) {
        try {
            moderatorService.markAsViewedReportTeam(idReportTeam);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/reportTeam/{idReportTeam}/toggle-unviewed")
    public ResponseEntity<Void> markAsUnviewedReportTeam(@PathVariable Integer idReportTeam) {
        try {
            moderatorService.markAsUnviewedReportTeam(idReportTeam);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/reportTeam/{idReportTeam}/delete")
    public ResponseEntity<Void> deleteReportTeam(@PathVariable Integer idReportTeam) {
        try {
            moderatorService.deleteReportTeam(idReportTeam);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok().build();
    }

    @GetMapping("/reportUsers")
    public Page<ModeratorUserReportDto> getUserReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return moderatorService.getUserReports(page, size);
    }

    @PatchMapping("/reportUser/{idReportUser}/accept")
    public ResponseEntity<Void> acceptReportUser(@PathVariable Integer idReportUser) {
        try {
            moderatorService.acceptReportUser(idReportUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/reportUser/{idReportUser}/reject")
    public ResponseEntity<Void> rejectReportUser(@PathVariable Integer idReportUser) {
        try {
            moderatorService.rejectReportUser(idReportUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/reportUser/{idReportUser}/toggle-viewed")
    public ResponseEntity<Void> markAsViewedReportUser(@PathVariable Integer idReportUser) {
        try {
            moderatorService.markAsViewedReportUser(idReportUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/reportUser/{idReportUser}/toggle-unviewed")
    public ResponseEntity<Void> markAsUnviewedReportUser(@PathVariable Integer idReportUser) {
        try {
            moderatorService.markAsUnviewedReportUser(idReportUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/reportUser/{idReportUser}/delete")
    public ResponseEntity<Void> deleteReportUser(@PathVariable Integer idReportUser) {
        try {
            moderatorService.deleteReportUser(idReportUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok().build();
    }
    @PostMapping("/notification/warning")
    public ResponseEntity<Void> sendWarning(
            @RequestBody ModeratorWarningRequest request,
            HttpServletRequest httpRequest
    ) {
        try {
            moderatorService.sendWarning(request, httpRequest);
        }catch (IllegalArgumentException exception){
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok().build();
    }

}