import { useContext, useState } from "react";
import { isAxiosError } from "axios";
import { AuthContext } from "../../context/AuthContext";
import { useCloseDefectReport, useConfirmDefectReport, useDefectReports } from "../../hooks/useDefectReport";
import type { DefectReport } from "../../hooks/useDefectReport";
import FormSelect from "../ui/FormSelect";

const labels = {
    OPEN: "Aberto", WAITING_RETURN: "Aguardando devolução", IN_MAINTENANCE: "Em manutenção",
    RESOLVED: "Resolvido", DISMISSED: "Descartado"
};
const formatDate = (value: string) => new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
const units = (quantity: number) => `${quantity} ${quantity === 1 ? "unidade" : "unidades"}`;

export default function DefectReportList({ itemId }: { itemId: number }) {
    const { user } = useContext(AuthContext);
    const { data, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage } = useDefectReports(itemId);
    const closeReport = useCloseDefectReport(itemId);
    const confirmReport = useConfirmDefectReport(itemId);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [action, setAction] = useState<"confirm" | "close">("confirm");
    const [quantity, setQuantity] = useState("1");
    const [status, setStatus] = useState<"RESOLVED" | "DISMISSED">("RESOLVED");
    const [notes, setNotes] = useState("");
    const [error, setError] = useState("");
    const isPending = closeReport.isPending || confirmReport.isPending;

    function openForm(report: DefectReport, nextAction: "confirm" | "close") {
        setEditingId(report.id);
        setAction(nextAction);
        setQuantity(String(report.quantity ?? 1));
        setStatus("RESOLVED");
        setNotes("");
        setError("");
    }

    function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        if (editingId === null || isPending) return;
        setError("");
        const callbacks = {
            onSuccess: () => { setEditingId(null); setNotes(""); },
            onError: (cause: unknown) => setError(isAxiosError(cause)
                ? cause.response?.data?.message ?? "Não foi possível atualizar o relato."
                : "Não foi possível atualizar o relato.")
        };
        if (action === "confirm") confirmReport.mutate({ id: editingId, quantity: Number(quantity) }, callbacks);
        else closeReport.mutate({ id: editingId, status, resolutionNotes: notes.trim() }, callbacks);
    }

    return (
        <section className="defect-reports" aria-label="Relatos de defeito">
            <h3>Relatos de defeito</h3>
            {isLoading && <p>Carregando relatos...</p>}
            {isError && <p role="alert">Não foi possível carregar os relatos.</p>}
            {data?.pages[0].totalElements === 0 && <p>Nenhum defeito relatado.</p>}
            {data?.pages.flatMap(page => page.content).map(report => (
                <article className="defect-report" key={report.id}>
                    <div className="defect-report-heading">
                        <strong>{report.reportedByName}</strong>
                        <span className={`defect-status defect-status-${report.status.toLowerCase()}`}>{labels[report.status]}</span>
                    </div>
                    <time dateTime={report.createdAt}>{formatDate(report.createdAt)}</time>
                    <p className="defect-origin">{report.quantity === null ? "Quantidade não informada (relato anterior)" : `${units(report.quantity)} com possível defeito`}{report.loanId ? " · Empréstimo" : " · Estoque disponível"}</p>
                    <p className="defect-description">{report.description}</p>
                    {report.confirmedAt && (
                        <div className="defect-resolution">
                            <p>{units(report.confirmedQuantity!)} para manutenção · Confirmado por {report.confirmedByName} em {formatDate(report.confirmedAt)}.</p>
                            {report.status === "WAITING_RETURN" && <p>Entrarão em manutenção na devolução do empréstimo.</p>}
                            {report.status === "IN_MAINTENANCE" && <p>Indisponíveis para novos empréstimos.</p>}
                        </div>
                    )}
                    {report.closedAt && (
                        <div className="defect-resolution"><p>{report.resolutionNotes}</p><small>{report.closedByName} · {formatDate(report.closedAt)}</small></div>
                    )}
                    {user?.role === "ADMIN" && (report.status === "OPEN" || report.status === "IN_MAINTENANCE") && (
                        editingId === report.id ? (
                            <form className="defect-close-form" onSubmit={handleSubmit}>
                                {action === "confirm" ? (
                                    <>
                                        <div className="form-group defect-quantity-field">
                                            <label htmlFor={`defect-confirm-quantity-${report.id}`}>Quantidade confirmada</label>
                                            <input id={`defect-confirm-quantity-${report.id}`} type="number" required min={1} step={1} max={report.quantity ?? undefined} value={quantity} disabled={isPending} onChange={event => setQuantity(event.target.value)} />
                                        </div>
                                        <p className="defect-origin">{report.loanId ? "Se o empréstimo estiver em andamento, as unidades entrarão em manutenção na devolução." : "As unidades confirmadas serão retiradas do estoque disponível para manutenção."}</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="form-group">
                                            <label htmlFor={`defect-status-${report.id}`}>Encerramento</label>
                                            <FormSelect id={`defect-status-${report.id}`} value={status} placeholder="Selecione" options={[{ value: "RESOLVED", label: report.status === "IN_MAINTENANCE" ? "Reparado" : "Resolvido" }, { value: "DISMISSED", label: "Descartado" }]} onChange={value => setStatus(value as "RESOLVED" | "DISMISSED")} />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor={`defect-notes-${report.id}`}>Solução ou motivo do descarte</label>
                                            <textarea id={`defect-notes-${report.id}`} required maxLength={3000} rows={3} value={notes} onChange={event => setNotes(event.target.value)} disabled={isPending} />
                                        </div>
                                        {report.status === "IN_MAINTENANCE" && <p className="defect-origin">Ao encerrar, {units(report.confirmedQuantity!)} voltarão ao estoque disponível. Encerre apenas se estiverem aptas para uso.</p>}
                                    </>
                                )}
                                {error && <p role="alert" className="defect-error">{error}</p>}
                                <div className="modal-actions-inline">
                                    <button type="button" className="modal-btn" disabled={isPending} onClick={() => setEditingId(null)}>Cancelar</button>
                                    <button type="submit" className="modal-btn primary" disabled={isPending || (action === "close" ? !notes.trim() : !Number.isInteger(Number(quantity)) || Number(quantity) < 1)}>{isPending ? "Salvando..." : "Confirmar"}</button>
                                </div>
                            </form>
                        ) : (
                            <div className="defect-report-actions">
                                {report.status === "OPEN" && <button type="button" className="header-btn" disabled={isPending} onClick={() => openForm(report, "confirm")}>Confirmar manutenção</button>}
                                <button type="button" className="header-btn ghost" disabled={isPending} onClick={() => openForm(report, "close")}>{report.status === "IN_MAINTENANCE" ? "Concluir manutenção" : "Encerrar relato"}</button>
                            </div>
                        )
                    )}
                </article>
            ))}
            {hasNextPage && <button type="button" className="header-btn ghost" disabled={isFetchingNextPage} onClick={() => fetchNextPage()}>{isFetchingNextPage ? "Carregando..." : "Carregar mais"}</button>}
        </section>
    );
}
