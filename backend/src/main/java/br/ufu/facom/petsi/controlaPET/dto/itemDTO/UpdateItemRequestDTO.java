package br.ufu.facom.petsi.controlaPET.dto.itemDTO;

import br.ufu.facom.petsi.controlaPET.model.enums.ItemCondition;
import br.ufu.facom.petsi.controlaPET.model.enums.ItemType;
import jakarta.validation.constraints.Min;

public record UpdateItemRequestDTO(
        String name,
        String description,
        ItemType type,
        ItemCondition condition,

        @Min(value = 0, message = "A quantidade total não pode ser negativa.")
        Integer totalQuantity,

        @Min(value = 0, message = "A quantidade em estoque não pode ser negativa.")
        Integer stockQuantity
) {
}
