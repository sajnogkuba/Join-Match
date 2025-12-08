package com.joinmatch.backend.controller;

import com.joinmatch.backend.service.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
public class ImageController {
    private final S3Service s3Service;

    @PostMapping("/upload/event")
    public ResponseEntity<String> uploadEventImage(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(s3Service.uploadFile(file, "events"));
    }

    @PostMapping("/upload/profile")
    public ResponseEntity<String> uploadProfileImage(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(s3Service.uploadFile(file, "profiles"));
    }

    @PostMapping("/upload/team")
    public ResponseEntity<String> uploadTeamImage(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(s3Service.uploadFile(file, "team"));
    }

    @PostMapping("/upload/sport")
    public ResponseEntity<String> uploadSportImage(@RequestParam("file") MultipartFile file) {
        String test = s3Service.uploadFile(file, "sport");
        System.out.println(test);
        return ResponseEntity.ok(test);
    }

}