package com.joinmatch.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;
    //@Async
    public void sendVerificationEmail(String to, String code) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("Weryfikacja konta JoinMatch");
            message.setText("Cześć!\n\nTwój kod weryfikacyjny to: " + code + "\n\nWpisz go w aplikacji, aby aktywować konto.\n\nPozdrawiamy,\nZespół JoinMatch");

            mailSender.send(message);
            System.out.println("Mail z kodem wysłany do: " + to);
        } catch (Exception e) {
            System.err.println("Błąd wysyłania maila do " + to + ": " + e.getMessage());
        }
    }
}