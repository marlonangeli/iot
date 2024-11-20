package iot.logi.api.exceptions;

public class SaveEntityException extends RuntimeException {

    public SaveEntityException(String message) {
        super(message);
    }

    public SaveEntityException(String message, Throwable cause) {
        super(message, cause);
    }
}
