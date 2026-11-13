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
