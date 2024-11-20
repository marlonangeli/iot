package iot.logi.api.dtos;

import iot.logi.api.models.enums.DeviceStatus;
import iot.logi.api.models.enums.DeviceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Data
public class DeviceDto {
    @NotBlank(message = "Nome do dispositivo é obrigatório")
    @Size(min = 3, max = 64, message = "Nome deve ter entre 3 e 64 caracteres")
    private String name;

    private Long locationId;

    @NotNull(message = "Tipo do dispositivo é obrigatório")
    private DeviceType type;

    @NotNull(message = "Status do dispositivo é obrigatório")
    private DeviceStatus status;

    private LocalDateTime lastTracking;
}
