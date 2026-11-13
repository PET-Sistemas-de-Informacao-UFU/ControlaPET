import { useEffect, useState } from "react";
import DateRangePicker from "../../components/ui/DateRangePicker";
import { SearchIcon } from "../../components/ui/Icons";
import { useAuditEvents } from "../../hooks/useAudit";
import type { AuditEvent, AuditEventType, AuditFilter, Log } from "../../interfaces/Log";
import CatalogFilter from "../Catalogo/CatalogFilter";

function formatDate(date: string) {
    const hasTime = date.includes("T");

    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        ...(hasTime ? { hour: "2-digit", minute: "2-digit" } : {})
    }).format(new Date(hasTime ? date : `${date}T12:00:00`));
}

function toLog(event: AuditEvent): Log {
    const labels = {
        DEFECT_REPORTED: { tag: "Defeito relatado", color: "var(--red)", text: `relatou um defeito em ${event.itemName}.` },
        DEFECT_RESOLVED: { tag: "Defeito resolvido", color: "var(--green)", text: `resolveu um relato de defeito em ${event.itemName}.` },
        DEFECT_DISMISSED: { tag: "Relato descartado", color: "var(--text-dim)", text: `descartou um relato de defeito em ${event.itemName}.` },
        LOAN_CREATED: { tag: "Retirada", color: "var(--blue)", text: `retirou ${event.quantity} ${event.quantity === 1 ? "unidade" : "unidades"} de ${event.itemName} por empréstimo.` },
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
    const [filter, setFilter] = useState<AuditFilter>({ startDate: null, endDate: null, name: null, itemName: null, type: null });
    const [startDateInput, setStartDateInput] = useState("");
    const [endDateInput, setEndDateInput] = useState("");
    const [nameInput, setNameInput] = useState("");
    const [itemInput, setItemInput] = useState("");
    const [typeInput, setTypeInput] = useState("");
    const { data, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage } = useAuditEvents(filter);
    const logs = data?.pages.flatMap((page) => page.content).map(toLog) ?? [];

    useEffect(() => {
        const timeout = window.setTimeout(() => setFilter({
            startDate: startDateInput || null,
            endDate: endDateInput || null,
            name: nameInput.trim() || null,
            itemName: itemInput.trim() || null,
            type: (typeInput as AuditEventType | "LOAN_ALL") || null
        }), 300);
        return () => window.clearTimeout(timeout);
    }, [startDateInput, endDateInput, nameInput, itemInput, typeInput]);

    return (
        <>
            <div className="catalog-toolbar audit-toolbar">
                <label className="search-bar"><SearchIcon /><input type="search" aria-label="Buscar por usuário" placeholder="Buscar usuário..." value={nameInput} onChange={(event) => setNameInput(event.target.value)} /></label>
                <label className="search-bar"><SearchIcon /><input type="search" aria-label="Buscar por item" placeholder="Buscar item..." value={itemInput} onChange={(event) => setItemInput(event.target.value)} /></label>
                <CatalogFilter label="Atividade" value={typeInput} onChange={setTypeInput} options={[
                    { value: "", label: "Todas as atividades" }, { value: "LOAN_ALL", label: "Empréstimos" }, { value: "LOAN_CREATED", label: "Retirada" },
                    { value: "LOAN_RETURNED", label: "Devolução" }, { value: "INBOUND", label: "Entrada" },
                    { value: "DEFECT_REPORTED", label: "Defeito relatado" }, { value: "DEFECT_RESOLVED", label: "Defeito resolvido" }, { value: "DEFECT_DISMISSED", label: "Relato descartado" },
                    { value: "OUTBOUND_CONSUMPTION", label: "Consumo" }, { value: "ADJUSTMENT", label: "Ajuste" },
                ]} />
                <DateRangePicker id="audit-search-date-range" startDate={startDateInput} endDate={endDateInput} onChange={(start, end) => { setStartDateInput(start); setEndDateInput(end); }} />
            </div>

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

            {!isLoading && !isError && hasNextPage && (
                <div className="audit-load-more">
                    <button type="button" className="header-btn ghost" disabled={isFetchingNextPage} onClick={() => fetchNextPage()}>
                        {isFetchingNextPage ? "Carregando..." : "Carregar mais"}
                    </button>
                </div>
            )}

        </>
    );
}
