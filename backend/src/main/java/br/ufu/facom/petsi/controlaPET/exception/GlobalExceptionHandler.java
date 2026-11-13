package br.ufu.facom.petsi.controlaPET.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.MailException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.ErrorResponse;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<StandardError> handleAuthenticationException(AuthenticationException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new StandardError(
                HttpStatus.UNAUTHORIZED.value(), "Credenciais inválidas ou sessão expirada.", LocalDateTime.now(), null));
    }

    @ExceptionHandler(MailException.class)
    public ResponseEntity<StandardError> handleMailException(MailException ex) {
        Throwable cause = ex.getMostSpecificCause();
        log.warn("Falha ao enviar e-mail: {}: {}", cause.getClass().getSimpleName(), cause.getMessage());
        StandardError error = new StandardError(
                HttpStatus.SERVICE_UNAVAILABLE.value(),
                "Não foi possível enviar o e-mail. Verifique a configuração de envio e tente novamente.",
                LocalDateTime.now(),
                null
        );
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(error);
    }

    // 1. Tratamento para erros de validação dos DTOs (@Valid, @NotNull, @Min)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<StandardError> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errors.put(error.getField(), error.getDefaultMessage());
        }

        StandardError error = new StandardError(
                HttpStatus.BAD_REQUEST.value(),
                "Erro na validação dos campos enviados.",
                LocalDateTime.now(),
                errors
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<StandardError> handleBusinessException(BusinessException ex) {
        StandardError error = new StandardError(
                HttpStatus.BAD_REQUEST.value(),
                ex.getMessage(),
                LocalDateTime.now(),
                null
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<StandardError> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        StandardError error = new StandardError(
                HttpStatus.BAD_REQUEST.value(),
                "Parâmetro de requisição inválido.",
                LocalDateTime.now(),
                null
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    // 4. Tratamento para acessos negados (Tentativa de burlar a role ou dono do empréstimo)
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<StandardError> handleAccessDeniedException(AccessDeniedException ex) {
        StandardError error = new StandardError(
                HttpStatus.FORBIDDEN.value(),
                ex.getMessage(),
                LocalDateTime.now(),
                null
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    // 5. Fallback genérico para erros inesperados do servidor (Protege a stack trace)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<StandardError> handleGlobalException(Exception ex, HttpServletRequest request) {
        if (ex instanceof ErrorResponse response && response.getStatusCode().is4xxClientError()) {
            StandardError error = new StandardError(
                    response.getStatusCode().value(),
                    "Não foi possível processar a requisição.",
                    LocalDateTime.now(),
                    null
            );
            return ResponseEntity.status(response.getStatusCode()).body(error);
        }
        log.error("Erro inesperado ao processar {} {}", request.getMethod(), request.getRequestURI(), ex);
        StandardError error = new StandardError(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Ocorreu um erro interno inesperado no servidor.",
                LocalDateTime.now(),
                null
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
