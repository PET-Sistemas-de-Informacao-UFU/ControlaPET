package br.ufu.facom.petsi.controlaPET.repository;

import br.ufu.facom.petsi.controlaPET.model.Movement;
import br.ufu.facom.petsi.controlaPET.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Arrays;
import java.util.List;

public interface MovementRepository extends JpaRepository<Movement, Long> {
    List<Movement> findAllByUser(User user);

    List<Movement> findAllByItemId(Long id);

    List<Movement> findTop5ByOrderByMovementDateDesc();
}
