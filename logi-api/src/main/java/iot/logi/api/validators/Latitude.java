package iot.logi.api.validators;

import jakarta.validation.Constraint;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.FIELD, ElementType.METHOD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = LatitudeValidator.class)
public @interface Latitude {
    String message() default "Latitude inválida";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}

class LatitudeValidator implements ConstraintValidator<Latitude, Double> {
    @Override
    public boolean isValid(Double value, ConstraintValidatorContext context) {
        if (value == null) {
            return false;
        }
        return value >= -90.0 && value <= 90.0;
    }
}
