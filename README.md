# Sistema de Inventário PET-SI (controlaPET)

## 📌 Sobre o Projeto
O **Sistema de Inventário PET-SI** (*controlaPET*) é uma aplicação web desenvolvida para otimizar a gestão de materiais e equipamentos da sala do **PET de Sistemas de Informação** da Universidade Federal de Uberlândia (UFU).

O sistema substitui o controle manual e traz segurança e rastreabilidade, permitindo:
- **Gestão de Itens:** Cadastro e controle de estoque de materiais de consumo (ex: post-its, café) e permanentes (ex: arduinos, monitores, câmeras).
- **Controle de Empréstimos:** Registro seguro de retiradas e devoluções de bens duráveis (com datas e status).
- **Gestão de Consumo (Movimentações):** Auditoria de entrada (Inbound), consumo (Outbound) e ajuste de materiais na sala.
- **Dashboard:** Visualização rápida de alertas, como itens com estoque baixo e empréstimos atrasados.

## 🚀 Tecnologias Utilizadas
- **Backend:** Java 21, Spring Boot (Web, Data JPA, Security, Validation)
- **Banco de Dados:** PostgreSQL 15
- **Segurança:** Autenticação Stateless via JWT (JSON Web Token)
- **Infraestrutura:** Docker e Docker Compose (para banco de dados local)
- **Frontend (Planejado):** React (Hospedado na Vercel)

---

## 🛠️ Pré-requisitos
Para executar o projeto na sua máquina local, você precisará instalar:
- Java Development Kit (JDK) 21
- Maven
- Docker Desktop (obrigatório para rodar o banco de dados facilmente)
- Git

---

## ⚙️ Como Executar o Projeto Localmente

### 1. Clonar o Repositório
Abra o seu terminal e clone este repositório para a sua máquina:
git clone https://github.com/SEU_USUARIO/inventario-pet.git
cd inventario-pet


### 2. Subir o Banco de Dados (Docker)
O projeto inclui um arquivo `docker-compose.yml` que já possui a configuração do PostgreSQL pronta para uso. Certifique-se de que o seu **Docker Desktop está aberto** e rodando em segundo plano.

No terminal, execute o comando na raiz do projeto:
docker compose up -d

*Isso fará o download da imagem do PostgreSQL e iniciará um container chamado `petsi-postgres` na porta 5432.*

### 3. Configuração de Variáveis (Opcional para Local)
O projeto foi estruturado utilizando variáveis de ambiente com valores padrão de fallback no arquivo `application.properties`. Se você vai apenas rodar localmente, **não é preciso alterar nada**.

As credenciais padrão do banco de dados (já configuradas no Docker Compose e no Spring Boot) são:
- **URL:** jdbc:postgresql://localhost:5432/inventario_pet
- **Usuário:** postgres
- **Senha:** postgres

O Spring Boot se encarregará de criar as tabelas automaticamente no banco (`ddl-auto=update`).

### 4. Conectar a um Banco Remoto (.env)
Se você precisa apontar a aplicação para um banco remoto (como o **Supabase**) em vez do Postgres local, copie o arquivo de exemplo na raiz do projeto e preencha os valores:
cp .env.example .env

O Spring Boot carrega esse arquivo automaticamente através da linha `spring.config.import` no `application.properties`. As variáveis disponíveis são:
- **`DB_URL_CONTROLAPET`:** URL JDBC do banco (no Supabase, use o *Transaction Pooler* e mantenha o `?prepareThreshold=0`)
- **`DB_USER_CONTROLAPET`:** usuário do banco
- **`DB_PASSWORD_CONTROLAPET`:** senha do banco
- **`JWT_SECRET_CONTROLAPET`:** chave de assinatura dos tokens (gere a sua com `openssl rand -base64 64 | tr -d '\n'`)

*O arquivo `.env` está no `.gitignore` e nunca deve ser commitado. O sufixo `_CONTROLAPET` evita conflito com variáveis genéricas (`DB_URL`, `JWT_SECRET`) que você possa ter exportadas no sistema por causa de outros projetos.*

### 5. Rodar a API Spring Boot
Agora basta iniciar o servidor da API. Se estiver usando o IntelliJ IDEA ou Eclipse, basta dar "Run" na classe principal da aplicação.

Pelo terminal, com o Maven:
cd backend
mvn spring-boot:run


A API estará disponível e rodando na porta **8080**: `http://localhost:8080`

---

## 📝 Padrões de Commit

O projeto segue rigorosamente a convenção do **Conventional Commits** para manter o histórico do Git limpo, rastreável e profissional.

As mensagens de commit devem ser escritas em minúsculo, no seguinte formato:
`<tipo>: <descrição curta em português>`

**Tipos utilizados no projeto:**
- **`feat:`** Adição de uma nova funcionalidade (ex: novos controllers, validações, serviços).
- **`fix:`** Correção de um bug ou erro no código.
- **`refactor:`** Reestruturação de um código existente que não adiciona uma funcionalidade nova nem corrige um bug (ex: otimização de DTOs).
- **`chore:`** Tarefas de manutenção, atualização de dependências, ou configurações gerais do sistema (ex: setup do Spring Security, JWT, Docker).
- **`docs:`** Alterações exclusivas na documentação (ex: atualizar o README.md).

**Exemplos de commits usados no projeto:**
- `chore: adiciona configuração base do Spring Security e JWT`
- `feat: implementa dashboard controller para metricas`
- `refactor: otimiza DTOs com flattening e usa enum LoanStatus`
- `fix: resolve erro ao buscar utilizador logado e corrige retorno da data`

*Observação: Para rodar localmente não é preciso configurar nada, pois as configurações estão blindadas através da sintaxe `${VARIAVEL:valor_padrao}`. O arquivo `.env.example` serve apenas para quem for apontar a aplicação para um banco remoto.*