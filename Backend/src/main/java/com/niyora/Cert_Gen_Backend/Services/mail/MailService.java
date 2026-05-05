package com.niyora.Cert_Gen_Backend.Services.mail;

import com.niyora.Cert_Gen_Backend.Entities.users.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;

    public void sendMailConfirmation(User user) {
//        SimpleMailMessage message = new SimpleMailMessage();
//
//        message.setFrom("sequelExtreme@gmail.com");
//        message.setTo(user.getEmail());
//        message.setSubject("E-mail Confirmation");
//        message.setText("This is the confirmation email address"+user.getMailOtp());
//        mailSender.send(message);

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom("sequelextreme@gmail.com");
            helper.setTo(user.getEmail());
            helper.setSubject("Email Confirmation - Intern Management System");

            String htmlContent = String.format(
                    "<html>" +
                            "<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>" +
                            "<div style='max-width: 600px; margin: 0 auto; padding: 20px;'>" +
                            "<h2 style='color: #2c5aa0; border-bottom: 2px solid #2c5aa0; padding-bottom: 10px;'>E-Banking System</h2>" +
                            "<p>Dear <strong>%s</strong>,</p>" +
                            "<p>Thank you for registering with Intern Management System.</p>" +
                            "<div style='background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;'>" +
                            "<p style='margin: 0; font-size: 16px;'>Your email confirmation OTP is:</p>" +
                            "<h1 style='color: #28a745; text-align: center; font-size: 32px; margin: 10px 0; letter-spacing: 3px;'>%s</h1>" +
                            "</div>" +
                            "<p><strong>Important:</strong></p>" +
                            "<ul>" +
                            "<li>Please enter this OTP to verify your email address</li>" +
                            "<li>This OTP will expire in <strong>10 minutes</strong></li>" +
                            "<li>Keep this OTP confidential</li>" +
                            "</ul>" +
                            "<p style='color: #dc3545; font-size: 14px;'>" +
                            "If you did not request this, please ignore this email." +
                            "</p>" +
                            "<hr style='border: none; border-top: 1px solid #dee2e6; margin: 30px 0;'>" +
                            "<p style='color: #6c757d; font-size: 12px;'>Best regards,<br>E-Banking System Team</p>" +
                            "</div>" +
                            "</body>" +
                            "</html>",
                    user.getUsername(),
                    user.getMailOtp()
            );

            helper.setText(htmlContent, true); // true indicates HTML content
            mailSender.send(mimeMessage);

        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email", e);
        }

    }



}
