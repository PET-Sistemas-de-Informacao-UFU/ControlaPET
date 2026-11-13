package br.ufu.facom.petsi.controlaPET.exception;

public class BusinessException extends IllegalArgumentException {
    public BusinessException(String message) {
        super(message);
    }
}
