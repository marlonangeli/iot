package iot.logi.api.dtos;

import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Data
public class DriverDto {
    @NotNull
    @NotBlank(message = "Nome do motorista é obrigatório")
    @Size(min = 3, max = 64, message = "Nome deve ter entre 3 e 64 caracteres")
    private String name;

    @Nullable
    private List<TransactionDto> transactions;
}
