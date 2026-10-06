package br.ufu.facom.petsi.controlaPET.controller;

import br.ufu.facom.petsi.controlaPET.model.User;
import br.ufu.facom.petsi.controlaPET.model.enums.UserRole;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdministrativeEndpointAuthorizationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @ParameterizedTest
    @ValueSource(strings = {"/api/audit", "/api/users", "/api/movements", "/api/loans"})
    void rejectsUnauthenticatedAccessToAdministrativeEndpoints(String endpoint) throws Exception {
        mockMvc.perform(get(endpoint))
                .andExpect(status().isUnauthorized());
    }

    @ParameterizedTest
    @ValueSource(strings = {"/api/audit", "/api/users", "/api/movements", "/api/loans"})
    void rejectsMemberAccessToAdministrativeEndpoints(String endpoint) throws Exception {
        mockMvc.perform(get(endpoint).with(user(member())))
                .andExpect(status().isForbidden());
    }

    private User member() {
        return User.builder()
                .name("Membro de teste")
                .email("membro@teste.com")
                .password("senha")
                .role(UserRole.MEMBER)
                .active(true)
                .build();
    }
}
