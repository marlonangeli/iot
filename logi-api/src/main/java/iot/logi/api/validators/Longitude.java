package iot.logi.api.validators;

import jakarta.validation.Constraint;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

class LongitudeValidator implements ConstraintValidator<Longitude, Double> {
    @Override
    public boolean isValid(Double value, ConstraintValidatorContext context) {
        if (value == null) {
            return false;
        }
        return value >= -180.0 && value <= 180.0;
    }
}

@Target({ElementType.FIELD, ElementType.METHOD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = LongitudeValidator.class)
public @interface Longitude {
    String message() default "Longitude inválida";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
