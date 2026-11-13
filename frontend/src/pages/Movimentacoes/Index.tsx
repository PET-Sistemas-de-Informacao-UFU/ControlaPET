import { isAxiosError } from "axios";
import { useAddDefectReport } from "../../hooks/useDefectReport";
import { useState } from "react";
import DefectReportModal from "../../components/item/DefectReportModal";
import { ChevronIcon } from "../../components/ui/Icons";
import Modal from "../../components/ui/Modal";
import Toast from "../../components/ui/Toast";
import { useReturnLoan, useUserLoans } from "../../hooks/useLoan";
import { useUserMovementHistory } from "../../hooks/useMovement";
import { useToast } from "../../hooks/useToast";
import type { Loan } from "../../interfaces/Loan";
import CatalogFilter from "../Catalogo/CatalogFilter";
import DateRangePicker from "../../components/ui/DateRangePicker";
import { SearchIcon } from "../../components/ui/Icons";

function formatDate(date?: string | null) {
    if (!date) return "—";

    const formattedDate = date.includes("T") ? new Date(date) : new Date(`${date}T12:00:00`);

    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).format(formattedDate);
}

function getLoanStatus(status: Loan["status"]) {
    if (status === "OVERDUE") return { label: "Atrasado", className: "overdue" };
    if (status === "COMPLETED") return { label: "Devolvido", className: "completed" };

    return { label: "Em andamento", className: "active" };
}

function returnDescription(loan: Loan) {
    if (!loan.actualReturnDate) return "Ainda não devolvido";
    const due = Date.parse(`${loan.expectedReturnDate}T00:00:00Z`);
    const returned = Date.parse(`${loan.actualReturnDate.slice(0, 10)}T00:00:00Z`);
    const days = Math.round((returned - due) / 86400000);
    return days > 0 ? `Devolvido com ${days} ${days === 1 ? "dia" : "dias"} de atraso` : "Devolvido no prazo";
}

export default function Movimentacoes() {
    const [itemName, setItemName] = useState("");
    const [historyType, setHistoryType] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const { data: loans = [], isLoading: isLoadingLoans, isError: hasLoanError } = useUserLoans();
    const {
        data: historyData,
        isLoading: isLoadingHistory,
        isError: hasHistoryError,
        hasNextPage,
        isFetchingNextPage,
        fetchNextPage
    } = useUserMovementHistory({ itemName: itemName.trim(), type: historyType, startDate, endDate });
    const returnLoan = useReturnLoan();
    const addDefectReport = useAddDefectReport();
    const { message, showToast } = useToast();

    const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
    const [historyLoan, setHistoryLoan] = useState<Loan | null>(null);
    const [defectModalOpen, setDefectModalOpen] = useState(false);

    const historico = historyData?.pages.flatMap((page) => page.content) ?? [];
    const activeLoans = loans
        .filter((loan) => loan.status === "ACTIVE" || loan.status === "OVERDUE")
        .sort((first, second) => {
            const firstPriority = first.status === "OVERDUE" ? 0 : 1;
            const secondPriority = second.status === "OVERDUE" ? 0 : 1;

            return firstPriority - secondPriority || first.expectedReturnDate.localeCompare(second.expectedReturnDate);
        });
    const overdueLoans = activeLoans.filter((loan) => loan.status === "OVERDUE");
    const completedLoans = loans.filter((loan) => loan.status === "COMPLETED");
    const isLoading = isLoadingLoans || isLoadingHistory;
    const hasError = hasLoanError || hasHistoryError;

    function openLoanModal(loan: Loan) {
        setSelectedLoan(loan);
    }

    function closeLoanModal() {
        setSelectedLoan(null);
    }

    function confirmReturn() {
        if (!selectedLoan) return;

        returnLoan.mutate(
            { loanId: selectedLoan.id },
            {
                onSuccess: () => {
                    showToast("Devolução concluída");
                    closeLoanModal();
                }
            }
        );
    }

    function handleDefectSubmit(description: string, quantity: number) {
        if (!selectedLoan || addDefectReport.isPending) return;
        addDefectReport.mutate({ itemId: selectedLoan.itemId, loanId: selectedLoan.id, description, quantity }, {
            onSuccess: () => { setDefectModalOpen(false); showToast("Defeito relatado"); },
            onError: error => showToast(isAxiosError(error) ? error.response?.data?.message ?? "Não foi possível enviar o relato" : "Não foi possível enviar o relato")
        });
    }

    return (
        <>
            <div className="loan-page-layout">
                    <div className="loan-summary" aria-label="Resumo de empréstimos">
                        <div className={overdueLoans.length ? "loan-summary-card warning" : "loan-summary-card"}>
                            <span>Atrasados</span>
                            <strong>{isLoadingLoans || hasLoanError ? "—" : overdueLoans.length}</strong>
                            <small>{isLoadingLoans || hasLoanError ? "Dados indisponíveis" : overdueLoans.length ? "Regularize assim que possível" : "Tudo em dia"}</small>
                        </div>
                        <div className="loan-summary-card">
                            <span>Em uso</span>
                            <strong>{isLoadingLoans || hasLoanError ? "—" : activeLoans.length}</strong>
                            <small>Empréstimos ativos</small>
                        </div>
                        <div className="loan-summary-card">
                            <span>Concluídos</span>
                            <strong>{isLoadingLoans || hasLoanError ? "—" : completedLoans.length}</strong>
                            <small>{completedLoans.length === 1 ? "Empréstimo devolvido" : "Empréstimos devolvidos"}</small>
                        </div>
                    </div>

                    <div className="loan-section-heading">
                        <div className="section-label">Em andamento</div>
                        {activeLoans.length > 0 && <span>{activeLoans.length} {activeLoans.length === 1 ? "item" : "itens"}</span>}
                    </div>

                    {isLoading && <div className="loan-empty-state">Carregando empréstimos...</div>}
                    {hasError && <div className="loan-empty-state error">Não foi possível carregar seus empréstimos.</div>}

                    {!isLoading && !hasError && (
                        <div className="loan-active-list">
                            {activeLoans.length ? activeLoans.map((loan) => {
                                const status = getLoanStatus(loan.status);

                                return (
                                    <button type="button" className="loan-card" key={loan.id} onClick={() => openLoanModal(loan)}>
                                        <div className="loan-card-header">
                                            <span className={`loan-status ${status.className}`}>{status.label}</span>
                                            <span className="loan-quantity">{loan.quantity} {loan.quantity === 1 ? "unidade" : "unidades"}</span>
                                        </div>
                                        <div className="loan-card-content">
                                            <div>
                                                <strong>{loan.itemName}</strong>
                                                <span>
                                                    {loan.status === "OVERDUE" ? "Prazo encerrado em" : "Devolver até"} {formatDate(loan.expectedReturnDate)}
                                                </span>
                                            </div>
                                            <ChevronIcon />
                                        </div>
                                    </button>
                                );
                            }) : <div className="loan-empty-state">Nenhum empréstimo em andamento encontrado.</div>}
                        </div>
                    )}

                    <div className="loan-section-heading history-heading">
                        <div className="section-label">Histórico</div>
                        {historico.length > 0 && <span>{historico.length} registros</span>}
                    </div>

                    <div className="catalog-toolbar movement-filters">
                        <label className="search-bar"><SearchIcon /><input type="search" aria-label="Buscar item no histórico" placeholder="Buscar item..." value={itemName} onChange={(event) => setItemName(event.target.value)} /></label>
                        <CatalogFilter label="Tipo" value={historyType} onChange={setHistoryType} options={[
                            { value: "", label: "Todo o histórico" }, { value: "LOAN_CREATED", label: "Empréstimo" }, { value: "LOAN_RETURNED", label: "Devolução" }, { value: "OUTBOUND_CONSUMPTION", label: "Consumo" },
                        ]} />
                        <DateRangePicker id="movement-date-range" startDate={startDate} endDate={endDate} onChange={(start, end) => { setStartDate(start); setEndDate(end); }} />
                    </div>

                    {!isLoading && !hasError && (
                        <div className="loan-history-list">
                            {historico.length ? historico.map((entry) => {
                                const loan = entry.type !== "OUTBOUND_CONSUMPTION" ? loans.find((item) => item.id === entry.sourceId) : undefined;
                                if (entry.type === "LOAN_CREATED") {
                                    return (
                                        <button type="button" className="loan-history-item history-loan-button" key={`${entry.type}-${entry.sourceId}-${entry.eventDate}`} onClick={() => loan && setHistoryLoan(loan)} disabled={!loan}>
                                            <div className="loan-history-icon borrowed">↗</div>
                                            <div>
                                                <span>Empréstimo em {formatDate(entry.eventDate)}</span>
                                                <strong>{entry.itemName}</strong>
                                                <small>{entry.quantity} {entry.quantity === 1 ? "unidade" : "unidades"}{loan ? ` · Prazo: ${formatDate(loan.expectedReturnDate)}` : ""}</small>
                                            </div>
                                            <ChevronIcon />
                                        </button>
                                    );
                                }
                                if (entry.type === "LOAN_RETURNED") {
                                    return (
                                        <button type="button" className="loan-history-item history-loan-button" key={`${entry.type}-${entry.sourceId}-${entry.eventDate}`} onClick={() => loan && setHistoryLoan(loan)} disabled={!loan}>
                                            <div className="loan-history-icon completed">↵</div>
                                            <div>
                                                <span>Devolvido em {formatDate(entry.eventDate)}</span>
                                                <strong>{entry.itemName}</strong>
                                                <small>{entry.quantity} {entry.quantity === 1 ? "unidade" : "unidades"}{loan ? ` · ${returnDescription(loan)}` : ""}</small>
                                            </div>
                                            <ChevronIcon />
                                        </button>
                                    );
                                }

                                return (
                                    <div className="loan-history-item" key={`${entry.type}-${entry.sourceId}-${entry.eventDate}`}>
                                        <div className="loan-history-icon consumption">−</div>
                                        <div>
                                            <span>Consumo em {formatDate(entry.eventDate)}</span>
                                            <strong>{entry.itemName}</strong>
                                            <small>{entry.quantity} {entry.quantity === 1 ? "unidade utilizada" : "unidades utilizadas"}{entry.notes ? ` · ${entry.notes}` : ""}</small>
                                        </div>
                                    </div>
                                );
                            }) : <div className="loan-empty-state">Nenhum registro no histórico.</div>}
                        </div>
                    )}

                    {!isLoading && !hasError && hasNextPage && (
                        <div className="movement-load-more">
                            <button type="button" className="header-btn ghost" disabled={isFetchingNextPage} onClick={() => fetchNextPage()}>
                                {isFetchingNextPage ? "Carregando..." : "Carregar mais"}
                            </button>
                        </div>
                    )}
            </div>

            <Modal
                open={selectedLoan !== null && !defectModalOpen}
                title={selectedLoan?.itemName ?? "Empréstimo"}
                subtitle={selectedLoan ? `${getLoanStatus(selectedLoan.status).label} · Retirado em ${formatDate(selectedLoan.checkoutDate)}` : undefined}
                closeLabel="Fechar"
                onClose={closeLoanModal}
                actions={
                    <div className="modal-actions-inline">
                        <div className="modal-btn danger" onClick={() => setDefectModalOpen(true)}>Relatar defeito</div>
                        <div className="modal-btn primary" onClick={confirmReturn}>Confirmar devolução</div>
                    </div>
                }
            >
                {selectedLoan && (
                    <div className="loan-modal-details">
                        <div>
                            <span>Quantidade a devolver</span>
                            <strong>{selectedLoan.quantity} {selectedLoan.quantity === 1 ? "unidade" : "unidades"}</strong>
                        </div>
                        <div>
                            <span>Prazo para devolução</span>
                            <strong>{formatDate(selectedLoan.expectedReturnDate)}</strong>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal open={historyLoan !== null} title={historyLoan?.itemName ?? "Empréstimo"} subtitle={historyLoan ? getLoanStatus(historyLoan.status).label : undefined} closeLabel="Fechar" onClose={() => setHistoryLoan(null)}>
                {historyLoan && <div className="loan-modal-details">
                    <div><span>Retirado em</span><strong>{formatDate(historyLoan.checkoutDate)}</strong></div>
                    <div><span>Prazo para devolução</span><strong>{formatDate(historyLoan.expectedReturnDate)}</strong></div>
                    <div><span>Quantidade</span><strong>{historyLoan.quantity} {historyLoan.quantity === 1 ? "unidade" : "unidades"}</strong></div>
                    {historyLoan.actualReturnDate && <div><span>Devolvido em</span><strong>{formatDate(historyLoan.actualReturnDate)}</strong></div>}
                    {historyLoan.actualReturnDate && <div><span>Situação da devolução</span><strong>{returnDescription(historyLoan)}</strong></div>}
                </div>}
            </Modal>

            <DefectReportModal
                key={`${selectedLoan?.id}-${defectModalOpen}`}
                isSubmitting={addDefectReport.isPending}
                maxQuantity={selectedLoan?.quantity ?? 0}
                open={defectModalOpen}
                itemName={selectedLoan?.itemName ?? "item"}
                onClose={() => setDefectModalOpen(false)}
                onConfirm={handleDefectSubmit}
            />

            <Toast message={message} />
        </>
    );
}
