package br.ufu.facom.petsi.controlaPET.controller;

import br.ufu.facom.petsi.controlaPET.model.User;
import br.ufu.facom.petsi.controlaPET.model.Item;
import br.ufu.facom.petsi.controlaPET.model.enums.ItemCondition;
import br.ufu.facom.petsi.controlaPET.model.enums.ItemType;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
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

    @Test
    void rejectsNegativeQuantityWhenCreatingItem() throws Exception {
        mockMvc.perform(post("/api/items")
                        .with(user(authenticatedUser(UserRole.ADMIN)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(ITEM_REQUEST.replace("\"totalQuantity\": 1", "\"totalQuantity\": -1")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.totalQuantity").value("A quantidade total não pode ser negativa."));
    }

    @Test
    void rejectsMemberItemUpdate() throws Exception {
        Item item = savedItem("Notebook", 2);

        mockMvc.perform(patch("/api/items/{id}", item.getId())
                        .with(user(authenticatedUser(UserRole.MEMBER)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Notebook atualizado\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void allowsAdminItemUpdate() throws Exception {
        Item item = savedItem("Notebook", 2);

        mockMvc.perform(patch("/api/items/{id}", item.getId())
                        .with(user(authenticatedUser(UserRole.ADMIN)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Notebook atualizado\",\"stockQuantity\":1}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Notebook atualizado"))
                .andExpect(jsonPath("$.stockQuantity").value(1));
    }

    @Test
    void rejectsNegativeQuantityWhenUpdatingItem() throws Exception {
        Item item = savedItem("Notebook", 2);

        mockMvc.perform(patch("/api/items/{id}", item.getId())
                        .with(user(authenticatedUser(UserRole.ADMIN)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"stockQuantity\":-1}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.stockQuantity").value("A quantidade em estoque não pode ser negativa."));
    }

    @Test
    void rejectsMemberItemDeletion() throws Exception {
        Item item = savedItem("Notebook", 2);

        mockMvc.perform(delete("/api/items/{id}", item.getId())
                        .with(user(authenticatedUser(UserRole.MEMBER))))
                .andExpect(status().isForbidden());
    }

    @Test
    void allowsAdminItemDeletion() throws Exception {
        Item item = savedItem("Notebook", 2);

        mockMvc.perform(delete("/api/items/{id}", item.getId())
                        .with(user(authenticatedUser(UserRole.ADMIN))))
                .andExpect(status().isNoContent());
    }

    @Test
    void returnsItemsPaginatedAndSortedByName() throws Exception {
        savedItem("Zebra", 1);
        savedItem("Adaptador", 1);
        savedItem("Cabo", 1);

        mockMvc.perform(get("/api/items?size=2&page=0")
                        .with(user(authenticatedUser(UserRole.MEMBER))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(2))
                .andExpect(jsonPath("$.content[0].name").value("Adaptador"))
                .andExpect(jsonPath("$.content[1].name").value("Cabo"))
                .andExpect(jsonPath("$.totalElements").value(3));
    }

    private Item savedItem(String name, int quantity) {
        return itemRepository.save(Item.builder()
                .name(name)
                .description("Item de teste")
                .type(ItemType.BORROWABLE)
                .condition(ItemCondition.GOOD)
                .totalQuantity(quantity)
                .stockQuantity(quantity)
                .build());
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
