package br.ufu.facom.petsi.controlaPET.dto.itemDTO;

import br.ufu.facom.petsi.controlaPET.model.enums.ItemCondition;
import br.ufu.facom.petsi.controlaPET.model.enums.ItemType;

import java.time.LocalDate;

public record ItemResponseDTO(
        Long id,
        String name,
        String description,
        ItemType type,
        ItemCondition condition,
        int totalQuantity,
        int stockQuantity,
        LocalDate createdAt,
        LocalDate updatedAt
) {
}
