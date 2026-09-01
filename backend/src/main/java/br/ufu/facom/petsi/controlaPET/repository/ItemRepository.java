package br.ufu.facom.petsi.controlaPET.repository;

import br.ufu.facom.petsi.controlaPET.model.Item;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ItemRepository extends JpaRepository<Item, Long> {
    long countByTotalQuantityLessThanEqual(int totalQuantity);

    Page<Item> findByNameContainingIgnoreCase(String name, Pageable pageable);
}
