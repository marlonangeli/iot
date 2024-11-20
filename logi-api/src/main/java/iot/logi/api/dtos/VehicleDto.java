package iot.logi.api.dtos;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Data
public class VehicleDto {
    @NotNull(message = "Nome do veículo é obrigatório")
    @Size(min = 3, max = 32, message = "Nome deve ter entre 3 e 32 caracteres")
    private String name;

    @NotNull(message = "Placa do veículo é obrigatória")
    @Size(min = 7, max = 7, message = "Placa deve ter 7 caracteres")
    private String plate;

    @NotNull(message = "Dispositivo do veículo é obrigatório")
    private Long deviceId;
}
