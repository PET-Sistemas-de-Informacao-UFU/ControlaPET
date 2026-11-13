# Atualização dos relatos de defeito

Em bancos existentes, pare o backend e execute `defect-report-maintenance.sql` antes de iniciar a nova versão. O script amplia a restrição dos status no PostgreSQL; o `ddl-auto=update` cria as novas colunas na inicialização. Em bancos novos, o Hibernate cria a estrutura completa.

Os relatos antigos mantêm a quantidade não informada. O administrador informa a quantidade ao confirmar a manutenção; nenhum relato antigo retira unidades automaticamente do estoque.

A confirmação de relatos do catálogo transfere unidades disponíveis para manutenção. Relatos ligados a empréstimos ativos aguardam a devolução, quando apenas as unidades sem defeito voltam à disponibilidade. A conclusão da manutenção devolve as unidades ao estoque disponível. Baixa definitiva e reparos parciais ainda não fazem parte deste fluxo.
