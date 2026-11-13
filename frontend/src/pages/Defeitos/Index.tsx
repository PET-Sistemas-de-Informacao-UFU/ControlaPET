import { useEffect, useState } from "react";
import { useAdminDefectReports, useDefectReport, useDefectReportSummary } from "../../hooks/useDefectReport";
import DefectReportCard, { DEFECT_STATUS_LABELS } from "../../components/item/DefectReportCard";
import Modal from "../../components/ui/Modal";
import { ChevronIcon, SearchIcon } from "../../components/ui/Icons";
import CatalogFilter from "../Catalogo/CatalogFilter";

const formatDate = (value: string) => new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));

export default function Defeitos() {
    const [search, setSearch] = useState("");
    const [itemName, setItemName] = useState("");
    const [status, setStatus] = useState("ACTIVE");
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const { data: summary, isError: summaryError } = useDefectReportSummary();
    const { data, isLoading, isError, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } = useAdminDefectReports(itemName, status);
    const { data: selected, isLoading: loadingSelected, isError: selectedError, refetch: refetchSelected } = useDefectReport(selectedId);
    const reports = data?.pages.flatMap(page => page.content) ?? [];

    useEffect(() => {
        const timeout = window.setTimeout(() => setItemName(search.trim()), 300);
        return () => window.clearTimeout(timeout);
    }, [search]);

    return (
        <>
            <div className="defect-overview" aria-label="Resumo dos relatos de defeito">
                {[
                    { status: "OPEN", label: "Aguardando avaliação", count: summary?.open },
                    { status: "WAITING_RETURN", label: "Aguardando devolução", count: summary?.waitingReturn },
                    { status: "IN_MAINTENANCE", label: "Em manutenção", count: summary?.inMaintenance }
                ].map(card => (
                    <button type="button" key={card.status} className={`defect-overview-card${status === card.status ? " active" : ""}`} aria-pressed={status === card.status} onClick={() => setStatus(card.status)}>
                        <span>{card.label}</span><strong>{summaryError ? "—" : card.count ?? "—"}</strong>
                    </button>
                ))}
            </div>
            <div className="catalog-toolbar defect-toolbar">
                <label className="search-bar"><SearchIcon /><input type="search" aria-label="Buscar item nos relatos" placeholder="Buscar item..." value={search} onChange={event => setSearch(event.target.value)} /></label>
                <CatalogFilter label="Status" value={status} onChange={setStatus} options={[
                    { value: "", label: "Todos os relatos" },
                    { value: "ACTIVE", label: "Ativos" },
                    { value: "OPEN", label: "Aguardando avaliação" },
                    { value: "WAITING_RETURN", label: "Aguardando devolução" },
                    { value: "IN_MAINTENANCE", label: "Em manutenção" },
                    { value: "RESOLVED", label: "Resolvidos" },
                    { value: "DISMISSED", label: "Descartados" },
                    { value: "WRITTEN_OFF", label: "Baixa definitiva" }
                ]} />
            </div>
            <div className="loan-section-heading"><div className="section-label">Relatos de defeito</div>{!isError && data && <span>{data.pages[0].totalElements} {data.pages[0].totalElements === 1 ? "relato" : "relatos"}</span>}</div>
            {isLoading ? <p className="catalog-empty">Carregando relatos...</p> : isError ? (
                <div className="catalog-empty"><p>Não foi possível carregar os relatos.</p><button type="button" className="header-btn ghost" onClick={() => refetch()}>Tentar novamente</button></div>
            ) : reports.length === 0 ? <p className="catalog-empty">Nenhum relato encontrado para estes filtros.</p> : (
                <div className="defect-inbox">
                    {reports.map(report => (
                        <button type="button" className="defect-inbox-row" key={report.id} onClick={() => setSelectedId(report.id)}>
                            <div className="defect-inbox-content">
                                <div className="defect-inbox-title"><strong>{report.itemName}</strong><span className={`defect-status defect-status-${report.status.toLowerCase()}`}>{DEFECT_STATUS_LABELS[report.status]}</span></div>
                                <p>{report.description}</p>
                                <small>{report.reportedByName} · {formatDate(report.createdAt)}{report.quantity === null ? "" : ` · ${report.quantity} ${report.quantity === 1 ? "unidade" : "unidades"}`}</small>
                            </div>
                            <ChevronIcon />
                        </button>
                    ))}
                </div>
            )}
            {hasNextPage && !isError && <div className="catalog-load-more"><button type="button" className="header-btn ghost" disabled={isFetchingNextPage} onClick={() => fetchNextPage()}>{isFetchingNextPage ? "Carregando..." : "Carregar mais"}</button></div>}
            <Modal open={selectedId !== null} title={selected?.itemName ?? "Relato de defeito"} sheetClassName="item-details-sheet" closeLabel="Fechar" onClose={() => setSelectedId(null)}>
                {loadingSelected ? <p>Carregando relato...</p> : selectedError ? (
                    <div><p role="alert">Não foi possível carregar o relato.</p><button type="button" className="header-btn ghost" onClick={() => refetchSelected()}>Tentar novamente</button></div>
                ) : selected && <DefectReportCard key={selected.id} report={selected} />}
            </Modal>
        </>
    );
}
