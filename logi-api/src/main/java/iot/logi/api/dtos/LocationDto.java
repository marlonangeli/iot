package iot.logi.api.dtos;

import iot.logi.api.models.enums.LocationType;
import iot.logi.api.validators.Latitude;
import iot.logi.api.validators.Longitude;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Data
public class LocationDto {
    @NotNull
    @NotBlank(message = "Nome da localização é obrigatório")
    @Size(min = 3, max = 64, message = "Nome deve ter entre 3 e 64 caracteres")
    private String name;

    @Latitude
    @NotNull(message = "Latitude da localização é obrigatório")
    private double latitude;

    @Longitude
    @NotNull(message = "Longitude da localização é obrigatório")
    private double longitude;

    @NotNull(message = "Tipo da localização é obrigatório")
    private LocationType type;
}
