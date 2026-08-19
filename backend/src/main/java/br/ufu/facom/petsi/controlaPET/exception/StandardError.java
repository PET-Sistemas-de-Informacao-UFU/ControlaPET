package br.ufu.facom.petsi.controlaPET.exception;

import java.time.LocalDateTime;
import java.util.Map;

public record StandardError(
        Integer status,
        String message,
        LocalDateTime timestamp,
        Map<String, String> fieldErrors
) {
}