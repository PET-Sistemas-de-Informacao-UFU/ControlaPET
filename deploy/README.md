# Docker de producao

O servidor precisa de Docker Engine e Docker Compose v2. Execute os comandos na raiz do repositorio. O Compose de producao inclui PostgreSQL 15, Java 21 e frontend compilado servido pelo Nginx. Maven e Node sao usados nas etapas de compilacao das imagens.

Na primeira instalacao, copie `deploy/.env.example` para `.env` na raiz do servidor e preencha credenciais, chave JWT propria, dominio HTTPS e dados do administrador. Proteja o arquivo com `chmod 600 .env`. O Compose configura a URL interna do banco e o frontend usa `/api`. O banco chama-se `controlapet`. A migration inicial roda automaticamente no backend.

```bash
docker compose -f docker-compose.prod.yml up -d --build --wait
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs --tail=100 backend
```

Depois do convite inicial, defina `BOOTSTRAP_ADMIN_ENABLED=false`. O SMTP e externo e precisa estar configurado para enviar convites e recuperar senhas. A verificacao de saude verifica aplicacao e banco; nao verifica entrega de e-mail.

O login permite ate 10 tentativas por e-mail em uma janela de 15 minutos, inclusive tentativas bem-sucedidas. O controle fica em memoria, reinicia com o backend e e independente em cada instancia; protecao distribuida e por IP deve ser configurada na infraestrutura depois de identificar os proxies confiaveis da UFU. Ao sair da conta, todas as sessoes desse usuario sao revogadas.

O token de acesso fica em memoria no navegador. O de renovacao e enviado em cookie HttpOnly, Secure e SameSite=Strict em producao; frontend e API precisam usar o mesmo dominio e HTTPS. Cada renovacao invalida o token anterior; o banco guarda somente seu hash. Login e renovacao exigem o cabecalho X-Auth-Request e permitem chamadas com credenciais apenas das origens configuradas no CORS. No desenvolvimento local o cookie nao exige HTTPS. O encerramento e a atualizacao desta versao invalidam tokens de renovacao anteriores; usuarios precisarao entrar novamente. Sem suporte a Web Locks, renovacoes simultaneas em abas diferentes podem exigir novo login.

A porta padrao e `127.0.0.1:8080`, acessivel no proprio servidor. Configure o Apache ou Nginx da UFU para encaminhar o dominio HTTPS para esse endereco. O Nginx do container serve o frontend e encaminha `/api` ao backend. Banco e backend nao publicam portas no servidor. Dominio, certificado HTTPS e compatibilidade com o site existente dependem da inspecao do servidor.

Os volumes `controlapet_database` e `controlapet_logs` persistem dados e logs. O backend executa com usuario sem privilegios. Logs da aplicacao seguem a rotacao configurada no Spring; logs dos containers sao limitados a tres arquivos de 10 MB por container. `restart: unless-stopped` reinicia processos que encerram e restaura os servicos apos reiniciar o Docker. Um container marcado como unhealthy exige investigacao; esse estado sozinho nao dispara reinicializacao.

Para atualizar, faca backup antes de baixar a nova versao e execute novamente `up -d --build --wait`. Migrations pendentes serao aplicadas. Uma reversao que envolva alteracoes no banco precisa considerar a restauracao do backup. Para parar use `docker compose -f docker-compose.prod.yml down`. **Nao use `down -v`: ele remove os volumes com banco e logs.**

Para usar o script de backup sem instalar clientes PostgreSQL no servidor:

```bash
mkdir -p /caminho/persistente/backups
docker compose -f docker-compose.prod.yml exec -T db bash -c 'PGUSER="$POSTGRES_USER" PGDATABASE="$POSTGRES_DB" bash /dev/stdin /tmp/backups' < deploy/backup-db.sh
docker compose -f docker-compose.prod.yml cp db:/tmp/backups/. /caminho/persistente/backups/
chmod 600 /caminho/persistente/backups/*
```

Copie os backups para armazenamento externo e defina agendamento e retencao no servidor. Para restaurar com o script abaixo, configure os clientes PostgreSQL ou execute-o no container com o arquivo de backup montado e um nome novo de banco.

# Backup e restauracao do PostgreSQL

Os scripts requerem Bash e os clientes PostgreSQL (`pg_dump`, `pg_restore` e `createdb`). Use a mesma versao principal do servidor ou uma versao de cliente compativel. A primeira migration foi validada com PostgreSQL 15.

Configure a conexao com `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER` e `PGPASSFILE`, ou com um servico em `PGSERVICE`. Os scripts nao carregam o `.env` da aplicacao; a URL JDBC desse arquivo nao e uma URL de conexao dos clientes PostgreSQL. O arquivo indicado por `PGPASSFILE` deve ter permissao `0600` e pertencer ao usuario do backup. Mantenha as credenciais fora do repositorio.

Para gerar um backup completo do banco, incluindo o historico do Flyway:

```bash
bash deploy/backup-db.sh /caminho/persistente/backups
```

O backup usa o formato customizado do PostgreSQL e so recebe o nome final depois que o dump termina com sucesso e seu indice pode ser lido. Arquivos recebem permissao `0600`; uma execucao que falha remove o arquivo parcial. A leitura do indice nao substitui uma restauracao de verificacao.

Para restaurar em um banco novo:

```bash
bash deploy/restore-db.sh /caminho/persistente/backups/arquivo.dump controlapet_restauracao
```

O usuario precisa de permissao para criar o banco. O script recusa um destino existente e restaura as tabelas e dados em uma unica transacao. Se a restauracao falhar, o banco novo pode permanecer vazio para investigacao; o script nao remove bancos automaticamente. Os objetos restaurados pertencem ao usuario que executa a restauracao.

Antes de apontar a aplicacao para o banco restaurado, confira os dados e a inicializacao com o perfil `prod`. O historico de migrations tambem deve ser preservado. O dump nao inclui usuarios e outras configuracoes globais do servidor PostgreSQL: permissoes e o usuario da aplicacao precisam ser preparados separadamente.

O agendamento, a retencao, o local persistente e uma copia fora do servidor ainda precisam ser definidos quando houver acesso ao ambiente da UFU. Evite guardar backups dentro do repositorio.
