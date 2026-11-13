import { useContext, useState } from "react";
import { isAxiosError } from "axios";
import { AuthContext } from "../../context/AuthContext";
import { useCloseDefectReport, useDefectReports } from "../../hooks/useDefectReport";
import type { DefectReportStatus } from "../../hooks/useDefectReport";
import FormSelect from "../ui/FormSelect";

const labels = { OPEN: "Aberto", RESOLVED: "Resolvido", DISMISSED: "Descartado" };
const formatDate = (value: string) => new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));

export default function DefectReportList({ itemId }: { itemId: number }) {
    const { user } = useContext(AuthContext);
    const { data, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage } = useDefectReports(itemId);
    const closeReport = useCloseDefectReport(itemId);
    const [closingId, setClosingId] = useState<number | null>(null);
    const [status, setStatus] = useState<Exclude<DefectReportStatus, "OPEN">>("RESOLVED");
    const [notes, setNotes] = useState("");
    const [error, setError] = useState("");

    function handleClose(event: React.FormEvent) {
        event.preventDefault();
        if (closingId === null || closeReport.isPending) return;
        setError("");
        closeReport.mutate({ id: closingId, status, resolutionNotes: notes.trim() }, {
            onSuccess: () => { setClosingId(null); setNotes(""); },
            onError: (cause) => setError(isAxiosError(cause) ? cause.response?.data?.message ?? "Não foi possível encerrar o relato." : "Não foi possível encerrar o relato.")
        });
    }

    return <section className="defect-reports" aria-label="Relatos de defeito">
        <h3>Relatos de defeito</h3>
        {isLoading && <p>Carregando relatos...</p>}
        {isError && <p role="alert">Não foi possível carregar os relatos.</p>}
        {data?.pages[0].totalElements === 0 && <p>Nenhum defeito relatado.</p>}
        {data?.pages.flatMap(page => page.content).map(report => <article className="defect-report" key={report.id}>
            <div className="defect-report-heading"><strong>{report.reportedByName}</strong><span className={`defect-status defect-status-${report.status.toLowerCase()}`}>{labels[report.status]}</span></div>
            <time dateTime={report.createdAt}>{formatDate(report.createdAt)}</time>
            <p className="defect-description">{report.description}</p>
            {report.closedAt && <div className="defect-resolution"><p>{report.resolutionNotes}</p><small>{report.closedByName} · {formatDate(report.closedAt)}</small></div>}
            {user?.role === "ADMIN" && report.status === "OPEN" && (closingId === report.id ?
                <form className="defect-close-form" onSubmit={handleClose}>
                    <div className="form-group"><label htmlFor={`defect-status-${report.id}`}>Encerramento</label><FormSelect id={`defect-status-${report.id}`} value={status} placeholder="Selecione" options={[{ value: "RESOLVED", label: "Resolvido" }, { value: "DISMISSED", label: "Descartado" }]} onChange={value => setStatus(value as Exclude<DefectReportStatus, "OPEN">)} /></div>
                    <div className="form-group"><label htmlFor={`defect-notes-${report.id}`}>Solução ou motivo do descarte</label><textarea id={`defect-notes-${report.id}`} required maxLength={3000} rows={3} value={notes} onChange={event => setNotes(event.target.value)} disabled={closeReport.isPending} /></div>
                    {error && <p role="alert" className="defect-error">{error}</p>}
                    <div className="modal-actions-inline"><button type="button" className="modal-btn" disabled={closeReport.isPending} onClick={() => setClosingId(null)}>Cancelar</button><button type="submit" className="modal-btn primary" disabled={closeReport.isPending || !notes.trim()}>{closeReport.isPending ? "Salvando..." : "Confirmar"}</button></div>
                </form> : <button type="button" className="header-btn ghost" disabled={closeReport.isPending} onClick={() => { setClosingId(report.id); setStatus("RESOLVED"); setNotes(""); setError(""); }}>Encerrar relato</button>)}
        </article>)}
        {hasNextPage && <button type="button" className="header-btn ghost" disabled={isFetchingNextPage} onClick={() => fetchNextPage()}>{isFetchingNextPage ? "Carregando..." : "Carregar mais"}</button>}
    </section>;
}
