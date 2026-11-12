package br.ufu.facom.petsi.controlaPET.repository;

import br.ufu.facom.petsi.controlaPET.model.Item;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

import java.util.Optional;

public interface ItemRepository extends JpaRepository<Item, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select item from Item item where item.id = :id")
    Optional<Item> findByIdForUpdate(@Param("id") Long id);

    long countByTotalQuantityLessThanEqual(int totalQuantity);

    @Query(
            value = """
                    SELECT * FROM items
                    WHERE (:type = '' OR type = :type)
                      AND (:condition = '' OR condition = :condition)
                      AND (:available = '' OR (:available = 'true' AND stock_quantity > 0) OR (:available = 'false' AND stock_quantity = 0))
                      AND (:name = '' OR translate(lower(name), 'áàâãäéèêëíìîïóòôõöúùûüç', 'aaaaaeeeeiiiiooooouuuuc')
                        LIKE concat('%', translate(lower(cast(:name as text)), 'áàâãäéèêëíìîïóòôõöúùûüç', 'aaaaaeeeeiiiiooooouuuuc'), '%'))
                    """,
            countQuery = """
                    SELECT count(*) FROM items
                    WHERE (:type = '' OR type = :type)
                      AND (:condition = '' OR condition = :condition)
                      AND (:available = '' OR (:available = 'true' AND stock_quantity > 0) OR (:available = 'false' AND stock_quantity = 0))
                      AND (:name = '' OR translate(lower(name), 'áàâãäéèêëíìîïóòôõöúùûüç', 'aaaaaeeeeiiiiooooouuuuc')
                        LIKE concat('%', translate(lower(cast(:name as text)), 'áàâãäéèêëíìîïóòôõöúùûüç', 'aaaaaeeeeiiiiooooouuuuc'), '%'))
                    """,
            nativeQuery = true
    )
    Page<Item> findFiltered(@Param("name") String name, @Param("type") String type,
                            @Param("condition") String condition, @Param("available") String available, Pageable pageable);
}
