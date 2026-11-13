package br.ufu.facom.petsi.controlaPET.service;

import br.ufu.facom.petsi.controlaPET.dto.itemDTO.CreateItemRequestDTO;
import br.ufu.facom.petsi.controlaPET.dto.itemDTO.ItemResponseDTO;
import br.ufu.facom.petsi.controlaPET.dto.itemDTO.UpdateItemRequestDTO;
import br.ufu.facom.petsi.controlaPET.model.Item;
import br.ufu.facom.petsi.controlaPET.model.enums.ItemType;
import br.ufu.facom.petsi.controlaPET.model.enums.ItemCondition;
import br.ufu.facom.petsi.controlaPET.repository.ItemRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ItemService {

    private final ItemRepository itemRepository;

    @Transactional
    public ItemResponseDTO createItem(CreateItemRequestDTO request) {
        Item item = Item.builder()
                .name(request.name())
                .description(request.description())
                .type(request.type())
                .condition(request.condition())
                .totalQuantity(request.totalQuantity())
                .stockQuantity(request.totalQuantity())
                .build();

        Item newItem = itemRepository.save(item);

        return new ItemResponseDTO(
                newItem.getId(),
                newItem.getName(),
                newItem.getDescription(),
                newItem.getType(),
                newItem.getCondition(),
                newItem.getTotalQuantity(),
                newItem.getStockQuantity(),
                newItem.getMaintenanceQuantity(),
                newItem.getCreatedAt(),
                newItem.getUpdatedAt()
        );
    }

    public Page<ItemResponseDTO> getAllItems(String name, ItemType type, ItemCondition condition, Boolean available, Pageable pageable) {
        Page<Item> itemPage = itemRepository.findFiltered(
                name == null ? "" : name.trim(), type == null ? "" : type.name(),
                condition == null ? "" : condition.name(), available == null ? "" : available.toString(), pageable);

        return itemPage.map(
                item -> new ItemResponseDTO(
                        item.getId(),
                        item.getName(),
                        item.getDescription(),
                        item.getType(),
                        item.getCondition(),
                        item.getTotalQuantity(),
                        item.getStockQuantity(),
                item.getMaintenanceQuantity(),
                        item.getCreatedAt(),
                        item.getUpdatedAt()
                )
        );
    }


    public ItemResponseDTO getItem(Long id) {
        Item item = itemRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Item não encontrado"));

        return new ItemResponseDTO(
                item.getId(),
                item.getName(),
                item.getDescription(),
                item.getType(),
                item.getCondition(),
                item.getTotalQuantity(),
                item.getStockQuantity(),
                item.getMaintenanceQuantity(),
                item.getCreatedAt(),
                item.getUpdatedAt()
        );
    }

    @Transactional
    public ItemResponseDTO updateItem(Long id, UpdateItemRequestDTO request) {
        Item item = itemRepository.findByIdForUpdate(id).orElseThrow(() -> new IllegalArgumentException("Item não encontrado"));

        if (request.name() != null) {
            item.setName(request.name());
        }

        if (request.description() != null) {
            item.setDescription(request.description());
        }

        if(request.type() != null) {
            item.setType(request.type());
        }

        if (request.condition() != null) {
            item.setCondition(request.condition());
        }

        int total = request.totalQuantity() == null ? item.getTotalQuantity() : request.totalQuantity();
        long stock = (long) item.getStockQuantity() + total - item.getTotalQuantity();
        if (stock < 0 || stock > Integer.MAX_VALUE)
            throw new IllegalArgumentException("A quantidade total deve preservar as unidades emprestadas e bloqueadas por defeito.");
        if (request.stockQuantity() != null && request.stockQuantity() != stock)
            throw new IllegalArgumentException("O estoque disponível deve preservar as unidades emprestadas e bloqueadas por defeito.");
        item.setTotalQuantity(total);
        item.setStockQuantity((int) stock);

        Item newItem = itemRepository.saveAndFlush(item);

        return new ItemResponseDTO(
                newItem.getId(),
                newItem.getName(),
                newItem.getDescription(),
                newItem.getType(),
                newItem.getCondition(),
                newItem.getTotalQuantity(),
                newItem.getStockQuantity(),
                newItem.getMaintenanceQuantity(),
                newItem.getCreatedAt(),
                newItem.getUpdatedAt()
        );
    }

    @Transactional
    public void deleteItem(Long id) {
        if (!itemRepository.existsById(id)) {
            throw new IllegalArgumentException("Item não encontrado com o ID: " + id);
        }

        itemRepository.deleteById(id);
    }
}
