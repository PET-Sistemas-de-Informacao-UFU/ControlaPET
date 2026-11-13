# Atualização dos relatos de defeito

Em bancos existentes, pare o backend e execute `defect-report-maintenance.sql` antes de iniciar a nova versão. O script amplia a restrição dos status no PostgreSQL; o `ddl-auto=update` cria as novas colunas na inicialização. Em bancos novos, o Hibernate cria a estrutura completa.

Novos relatos do catálogo bloqueiam imediatamente a quantidade informada, transferindo unidades disponíveis para o contador de unidades indisponíveis por defeito (`maintenanceQuantity`). O total não muda. O status permanece aberto, aguardando avaliação. Ao confirmar menos unidades, o administrador libera o excedente; ao descartar o relato, libera toda a reserva.

Relatos ligados a empréstimos ativos reservam a quantidade dentro do próprio empréstimo. Na devolução, essas unidades ficam bloqueadas, mesmo que o administrador ainda não tenha avaliado o relato. Somente as demais unidades voltam à disponibilidade. O descarte anterior à devolução remove o bloqueio por defeito, mas não encerra o empréstimo.

Relatos antigos sem reserva explícita preservam o comportamento anterior: os já confirmados mantêm suas unidades bloqueadas; os não confirmados só bloqueiam unidades ao serem confirmados. Quantidades antigas desconhecidas não são inferidas. A criação das novas colunas não altera automaticamente o estoque dos relatos antigos.

O reparo devolve as unidades ao estoque disponível. A baixa definitiva remove a quantidade confirmada do contador de indisponíveis e do total, sem aumentar a disponibilidade, com motivo obrigatório e registro na auditoria. O descarte do relato só é permitido antes da confirmação. Cada encerramento se aplica a todas as unidades confirmadas daquele relato; reparos ou baixas parciais ainda não fazem parte deste fluxo.

Se a etapa anterior de manutenção já foi instalada, execute novamente `defect-report-maintenance.sql` antes de usar a baixa definitiva para incluir o status `WRITTEN_OFF`. O script pode ser reaplicado.
