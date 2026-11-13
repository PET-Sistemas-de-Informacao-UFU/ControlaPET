import { useContext, useState } from "react";
import { isAxiosError } from "axios";
import { AuthContext } from "../../context/AuthContext";
import { useCloseDefectReport, useConfirmDefectReport } from "../../hooks/useDefectReport";
import type { DefectReport } from "../../hooks/useDefectReport";

export const DEFECT_STATUS_LABELS = {
    OPEN: "Aguardando avaliação", WAITING_RETURN: "Aguardando devolução", IN_MAINTENANCE: "Em manutenção",
    RESOLVED: "Resolvido", DISMISSED: "Relato descartado", WRITTEN_OFF: "Baixa definitiva"
};
const formatDate = (value: string) => new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
type ReportAction = "confirm" | "resolve" | "dismiss" | "writeOff";
const actionLabels = { confirm: "Confirmar manutenção", resolve: "Concluir reparo", dismiss: "Descartar relato", writeOff: "Dar baixa definitiva" };
const units = (quantity: number) => `${quantity} ${quantity === 1 ? "unidade" : "unidades"}`;

export default function DefectReportCard({ report }: { report: DefectReport }) {
    const itemId = report.itemId;
    const { user } = useContext(AuthContext);
    const closeReport = useCloseDefectReport(itemId);
    const confirmReport = useConfirmDefectReport(itemId);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [action, setAction] = useState<ReportAction>("confirm");
    const [quantity, setQuantity] = useState("1");
    const [notes, setNotes] = useState("");
    const [error, setError] = useState("");
    const isPending = closeReport.isPending || confirmReport.isPending;

    function openForm(report: DefectReport, nextAction: ReportAction) {
        setEditingId(report.id);
        setAction(nextAction);
        setQuantity(String(report.quantity ?? 1));
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
        else closeReport.mutate({
            id: editingId,
            status: action === "writeOff" ? "WRITTEN_OFF" : action === "dismiss" ? "DISMISSED" : "RESOLVED",
            resolutionNotes: notes.trim()
        }, callbacks);
    }

    return (
                <article className="defect-report" key={report.id}>
                    <div className="defect-report-heading">
                        <strong>{report.reportedByName}</strong>
                        <span className={`defect-status defect-status-${report.status.toLowerCase()}`}>{DEFECT_STATUS_LABELS[report.status]}</span>
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
                                            <div className="number-input">
                                                <input id={`defect-confirm-quantity-${report.id}`} type="number" required min={1} step={1} max={report.quantity ?? undefined} value={quantity} disabled={isPending} onChange={event => setQuantity(event.target.value)} />
                                                <div className="number-stepper">
                                                    <button type="button" aria-label="Aumentar quantidade" disabled={isPending || (report.quantity !== null && Number(quantity) >= report.quantity)} onClick={() => setQuantity(current => String(Math.min(report.quantity ?? Infinity, Math.max(1, Number(current) + 1))))}>
                                                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 15 6-6 6 6" /></svg>
                                                    </button>
                                                    <button type="button" aria-label="Diminuir quantidade" disabled={isPending || Number(quantity) <= 1} onClick={() => setQuantity(current => String(Math.max(1, Math.min(report.quantity ?? Infinity, Number(current) - 1))))}>
                                                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        {report.reservedQuantity === 0 && <p className="defect-origin">{report.loanId ? "Se o empréstimo estiver em andamento, as unidades entrarão em manutenção na devolução." : "As unidades confirmadas serão retiradas do estoque disponível para manutenção."}</p>}
                                    </>
                                ) : (
                                    <>
                                        {action === "dismiss" && <strong className="defect-action-title">{actionLabels[action]}</strong>}
                                        <div className="form-group">
                                            <label htmlFor={`defect-notes-${report.id}`}>{action === "writeOff" ? "Motivo da baixa definitiva" : action === "dismiss" ? "Motivo do descarte do relato" : "Reparo realizado"}</label>
                                            <textarea id={`defect-notes-${report.id}`} required maxLength={3000} rows={3} value={notes} onChange={event => setNotes(event.target.value)} disabled={isPending} />
                                        </div>
                                        {action === "writeOff" && <p className="defect-write-off-warning">A baixa removerá definitivamente {units(report.confirmedQuantity!)} do estoque total.</p>}
                                    </>
                                )}
                                {error && <p role="alert" className="defect-error">{error}</p>}
                                <div className="modal-actions-inline">
                                    <button type="button" className="modal-btn" disabled={isPending} onClick={() => setEditingId(null)}>Cancelar</button>
                                    <button type="submit" className={action === "writeOff" ? "modal-btn danger" : "modal-btn primary"} disabled={isPending || (action !== "confirm" ? !notes.trim() : !Number.isInteger(Number(quantity)) || Number(quantity) < 1)}>{isPending ? "Salvando..." : actionLabels[action]}</button>
                                </div>
                            </form>
                        ) : (
                            <div className="modal-actions-inline">
                                {report.status === "OPEN" ? (
                                    <>
                                        <button type="button" className="modal-btn" disabled={isPending} onClick={() => openForm(report, "dismiss")}>Descartar relato</button>
                                        <button type="button" className="modal-btn primary" disabled={isPending} onClick={() => openForm(report, "confirm")}>Confirmar manutenção</button>
                                    </>
                                ) : (
                                    <>
                                        <button type="button" className="modal-btn danger" disabled={isPending} onClick={() => openForm(report, "writeOff")}>Dar baixa</button>
                                        <button type="button" className="modal-btn primary" disabled={isPending} onClick={() => openForm(report, "resolve")}>Concluir reparo</button>
                                    </>
                                )}
                            </div>
                        )
                    )}
                </article>
    );
}
