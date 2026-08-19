package br.ufu.facom.petsi.controlaPET.dto.itemDTO;

import br.ufu.facom.petsi.controlaPET.model.enums.ItemCondition;
import br.ufu.facom.petsi.controlaPET.model.enums.ItemType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateItemRequestDTO(
        @NotBlank(message = "O nome do item é obrigatório.")
        String name,

        @NotBlank(message = "A descrição do item é obrigatória.")
        String description,

        @NotNull(message = "O tipo do item é obrigatório.")
        ItemType type,

        @NotNull(message = "A condição do item é obrigatória.")
        ItemCondition condition,

        @Min(value = 0, message = "A quantidade total não pode ser negativa.")
        int totalQuantity,

        @Min(value = 0, message = "A quantidade em estoque não pode ser negativa.")
        int stockQuantity
) {
}
