package br.ufu.facom.petsi.controlaPET.repository;

import br.ufu.facom.petsi.controlaPET.model.Movement;
import br.ufu.facom.petsi.controlaPET.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MovementRepository extends JpaRepository<Movement, Long> {
    Page<Movement> findAllByUser(User user, Pageable pageable);

    Page<Movement> findAllByItemId(Long id, Pageable pageable);

    List<Movement> findTop5ByOrderByMovementDateDesc();
}
