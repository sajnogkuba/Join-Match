package com.joinmatch.backend.controller;

import com.joinmatch.backend.dto.Moderator.GetStatisticsForDashboard;
import com.joinmatch.backend.dto.Moderator.ModeratorEventReportListItemDto;
import com.joinmatch.backend.service.ModeratorService;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/moderator")
@RequiredArgsConstructor
public class ModeratorController {
    private final ModeratorService moderatorService;

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
}