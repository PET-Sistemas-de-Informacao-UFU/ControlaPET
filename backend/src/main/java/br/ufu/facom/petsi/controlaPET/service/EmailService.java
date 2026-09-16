package br.ufu.facom.petsi.controlaPET.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String from;

    public void sendPasswordReset(String recipient, String resetUrl) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(recipient);
        message.setSubject("Redefinição de senha - ControlaPET");
        message.setText("Recebemos uma solicitação para redefinir sua senha no ControlaPET.\n\n"
                + "Use o link abaixo para criar uma nova senha. Ele expira em 30 minutos:\n"
                + resetUrl
                + "\n\nSe você não solicitou a redefinição, ignore este e-mail.");
        mailSender.send(message);
    }
}
