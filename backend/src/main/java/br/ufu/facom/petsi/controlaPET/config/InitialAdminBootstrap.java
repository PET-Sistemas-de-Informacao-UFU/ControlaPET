package br.ufu.facom.petsi.controlaPET.config;

import br.ufu.facom.petsi.controlaPET.dto.userDTO.CreateUserRequestDTO;
import br.ufu.facom.petsi.controlaPET.model.enums.UserRole;
import br.ufu.facom.petsi.controlaPET.repository.UserRepository;
import br.ufu.facom.petsi.controlaPET.service.UserService;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@ConditionalOnProperty(name = "app.bootstrap-admin.enabled", havingValue = "true")
@RequiredArgsConstructor
@Slf4j
public class InitialAdminBootstrap implements ApplicationRunner {
    private final UserRepository userRepository;
    private final UserService userService;
    private final Validator validator;
    private final JdbcTemplate jdbcTemplate;

    @Value("${app.bootstrap-admin.name:}")
    private String name;

    @Value("${app.bootstrap-admin.email:}")
    private String email;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        // Serializa a verificacao e a criacao mesmo se duas instancias iniciarem juntas.
        jdbcTemplate.execute("LOCK TABLE users IN SHARE ROW EXCLUSIVE MODE");
        if (userRepository.count() > 0) {
            log.warn("Criacao do administrador inicial ignorada: o banco ja possui usuarios. Desative BOOTSTRAP_ADMIN_ENABLED.");
            return;
        }

        CreateUserRequestDTO request = new CreateUserRequestDTO(name.trim(), email.trim(), UserRole.ADMIN);
        if (!validator.validate(request).isEmpty()) {
            throw new IllegalStateException("Informe BOOTSTRAP_ADMIN_NAME e BOOTSTRAP_ADMIN_EMAIL validos para criar o administrador inicial.");
        }
        userService.createUser(request);
        log.info("Administrador inicial criado; link de definicao de senha enviado por e-mail.");
    }
}
