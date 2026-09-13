import { useState } from "react";
import Modal from "../../components/ui/Modal";
import { FilterIcon } from "../../components/ui/Icons";
import { useIsDesktop } from "../../hooks/useIsDesktop";
import { useAuditEvents } from "../../hooks/useAudit";
import type { AuditEvent, AuditFilter, Log } from "../../interfaces/Log";

function formatDate(date: string) {
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).format(new Date(`${date}T00:00:00`));
}

function toLog(event: AuditEvent): Log {
    const labels = {
        LOAN_CREATED: { tag: "Empréstimo", color: "var(--blue)", text: `registrou empréstimo de ${event.quantity} ${event.quantity === 1 ? "unidade" : "unidades"} de ${event.itemName}.` },
        LOAN_RETURNED: { tag: "Devolução", color: "var(--green)", text: `devolveu ${event.quantity} ${event.quantity === 1 ? "unidade" : "unidades"} de ${event.itemName}.` },
        INBOUND: { tag: "Entrada", color: "var(--green)", text: `registrou entrada de ${event.quantity} ${event.quantity === 1 ? "unidade" : "unidades"} de ${event.itemName}.` },
        OUTBOUND_CONSUMPTION: { tag: "Consumo", color: "var(--orange)", text: `registrou consumo de ${event.quantity} ${event.quantity === 1 ? "unidade" : "unidades"} de ${event.itemName}.` },
        ADJUSTMENT: { tag: "Ajuste", color: "var(--orange)", text: `ajustou ${event.quantity} ${event.quantity === 1 ? "unidade" : "unidades"} de ${event.itemName}.` }
    };
    const label = labels[event.type];

    return {
        id: `${event.type}-${event.sourceId}-${event.eventDate}`,
        tag: label.tag,
        time: formatDate(event.eventDate),
        date: event.eventDate,
        who: event.userName,
        text: label.text,
        color: label.color
    };
}

export default function Auditoria() {
    const isDesktop = useIsDesktop();
    const [filter, setFilter] = useState<AuditFilter>({ date: null, name: null });
    const [searchOpen, setSearchOpen] = useState(false);
    const [dateInput, setDateInput] = useState("");
    const [nameInput, setNameInput] = useState("");
    const { data, isLoading, isError } = useAuditEvents(filter);
    const logs = (data?.content ?? []).map(toLog);

    function openSearchModal() {
        setDateInput(filter.date ?? "");
        setNameInput(filter.name ?? "");
        setSearchOpen(true);
    }

    function applyFilter() {
        setFilter({ date: dateInput || null, name: nameInput.trim() || null });
        setSearchOpen(false);
    }

    function clearFilter() {
        setFilter({ date: null, name: null });
        setDateInput("");
        setNameInput("");
        setSearchOpen(false);
    }

    const fields = (
        <>
            <div className="form-group">
                <label htmlFor="audit-search-date">Data</label>
                <input
                    type="date"
                    id="audit-search-date"
                    value={dateInput}
                    onChange={(event) => setDateInput(event.target.value)}
                />
            </div>

            <div className="form-group">
                <label htmlFor="audit-search-name">Nome</label>
                <input
                    type="text"
                    id="audit-search-name"
                    placeholder="Ex: Thiago"
                    value={nameInput}
                    onChange={(event) => setNameInput(event.target.value)}
                />
            </div>
        </>
    );

    return (
        <>
            {isDesktop ? (
                <div className="audit-filters">
                    {fields}
                    <button type="button" className="header-btn" onClick={applyFilter}>Buscar</button>
                    <button type="button" className="header-btn ghost" onClick={clearFilter}>Limpar</button>
                </div>
            ) : (
                <div className="search-bar" onClick={openSearchModal}>
                    <FilterIcon /><span>Pesquisar / Filtrar...</span>
                </div>
            )}

            <div className="section-label">Histórico de atividades</div>

            <div className="audit-list">
                {isLoading ? (
                    <div className="catalog-empty">Carregando atividades...</div>
                ) : isError ? (
                    <div className="catalog-empty">Erro ao carregar as atividades.</div>
                ) : logs.length ? logs.map((log) => (
                    <div className="log-item" key={log.id}>
                        <div className="log-dotline">
                            <div className="log-dot" style={{ background: log.color }}></div>
                            <div className="log-thread"></div>
                        </div>
                        <div className="log-body">
                            <div className="log-time"><b>{log.tag}</b> - {log.time}</div>
                            <div className="log-text"><b>{log.who}</b> {log.text}</div>
                        </div>
                    </div>
                )) : (
                    <div className="catalog-empty">Nenhuma atividade encontrada.</div>
                )}
            </div>

            {!isDesktop && (
                <Modal
                    open={searchOpen}
                    title="Pesquisar auditoria"
                    subtitle="Filtre por data e/ou por quem realizou a ação"
                    closeLabel="Cancelar"
                    onClose={() => setSearchOpen(false)}
                    actions={
                        <>
                            <div className="modal-btn primary" onClick={applyFilter}>Buscar</div>
                            <div className="modal-btn" onClick={clearFilter}>Limpar filtro</div>
                        </>
                    }
                >
                    {fields}
                </Modal>
            )}
        </>
    );
}
