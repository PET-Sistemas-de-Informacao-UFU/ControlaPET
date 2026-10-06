package br.ufu.facom.petsi.controlaPET.controller;

import br.ufu.facom.petsi.controlaPET.model.User;
import br.ufu.facom.petsi.controlaPET.model.enums.UserRole;
import br.ufu.facom.petsi.controlaPET.repository.ItemRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ItemAuthorizationIntegrationTest {

    private static final String ITEM_REQUEST = """
            {
              "name": "Cabo HDMI",
              "description": "Cabo para teste",
              "type": "CONSUMABLE",
              "condition": "GOOD",
              "totalQuantity": 1
            }
            """;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ItemRepository itemRepository;

    @AfterEach
    void cleanDatabase() {
        itemRepository.deleteAll();
    }

    @Test
    void rejectsUnauthenticatedItemCreation() throws Exception {
        mockMvc.perform(post("/api/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(ITEM_REQUEST))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void rejectsMemberItemCreation() throws Exception {
        mockMvc.perform(post("/api/items")
                        .with(user(authenticatedUser(UserRole.MEMBER)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(ITEM_REQUEST))
                .andExpect(status().isForbidden());
    }

    @Test
    void allowsAdminItemCreation() throws Exception {
        mockMvc.perform(post("/api/items")
                        .with(user(authenticatedUser(UserRole.ADMIN)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(ITEM_REQUEST))
                .andExpect(status().isCreated());
    }

    private User authenticatedUser(UserRole role) {
        return User.builder()
                .name("Usuário de teste")
                .email("usuario@teste.com")
                .password("senha")
                .role(role)
                .active(true)
                .build();
    }
}
