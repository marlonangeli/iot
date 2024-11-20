package iot.logi.api.dtos;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Data
public class TransactionDto {

    @NotNull(message = "Local de origem é obrigatório")
    private Long originLocationId;

    @NotNull(message = "Local de destino é obrigatório")
    private Long destinyLocationId;

    @NotNull(message = "Veículo é obrigatório")
    private Long vehicleId;

    @NotNull(message = "Motorista é obrigatório")
    private Long driverId;

    private LocalDateTime dispatchTime;

    private LocalDateTime arrivalTime;

    @Size(max = 80, message = "Descrição da carga deve ter no máximo 80 caracteres")
    private String cargoDescription;
}
