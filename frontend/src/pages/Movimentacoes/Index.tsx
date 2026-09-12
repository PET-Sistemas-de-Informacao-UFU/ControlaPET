import { useState } from "react";
import DefectReportModal from "../../components/item/DefectReportModal";
import { ChevronIcon } from "../../components/ui/Icons";
import Modal from "../../components/ui/Modal";
import Toast from "../../components/ui/Toast";
import { useReturnLoan, useUserLoans } from "../../hooks/useLoan";
import { useUserMovements } from "../../hooks/useMovement";
import { useToast } from "../../hooks/useToast";
import type { Loan } from "../../interfaces/Loan";
import type { Movement } from "../../interfaces/Movement";

type FeedItem =
    | { kind: "loan"; loan: Loan; date: string | null }
    | { kind: "movement"; movement: Movement; date: string };

function formatDate(date?: string | null) {
    if (!date) return "—";

    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).format(new Date(`${date}T12:00:00`));
}

function getLoanStatus(status: Loan["status"]) {
    if (status === "OVERDUE") return { label: "Atrasado", className: "overdue" };
    if (status === "COMPLETED") return { label: "Devolvido", className: "completed" };

    return { label: "Em andamento", className: "active" };
}

export default function Movimentacoes() {
    const { data: loansPage, isLoading: isLoadingLoans, isError: hasLoanError } = useUserLoans();
    const { data: movementsPage, isLoading: isLoadingMovements, isError: hasMovementError } = useUserMovements();
    const returnLoan = useReturnLoan();
    const { message, showToast } = useToast();

    const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
    const [defectModalOpen, setDefectModalOpen] = useState(false);

    const loans = loansPage?.content ?? [];
    const consumos = (movementsPage?.content ?? []).filter((movement) => movement.type === "OUTBOUND_CONSUMPTION");
    const activeLoans = loans
        .filter((loan) => loan.status === "ACTIVE" || loan.status === "OVERDUE")
        .sort((first, second) => {
            const firstPriority = first.status === "OVERDUE" ? 0 : 1;
            const secondPriority = second.status === "OVERDUE" ? 0 : 1;

            return firstPriority - secondPriority || first.expectedReturnDate.localeCompare(second.expectedReturnDate);
        });
    const overdueLoans = activeLoans.filter((loan) => loan.status === "OVERDUE");
    const completedLoans = loans.filter((loan) => loan.status === "COMPLETED");
    const isLoading = isLoadingLoans || isLoadingMovements;
    const hasError = hasLoanError || hasMovementError;

    const historico: FeedItem[] = [
        ...loans
            .filter((loan) => loan.status === "COMPLETED")
            .map((loan) => ({ kind: "loan" as const, loan, date: loan.actualReturnDate })),
        ...consumos.map((movement) => ({ kind: "movement" as const, movement, date: movement.movementDate }))
    ].sort((first, second) => (second.date ?? "").localeCompare(first.date ?? ""));

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

    function handleDefectSubmit(description: string) {
        void description;
        setDefectModalOpen(false);
        showToast("Defeito reportado");
    }

    return (
        <>
            <div className="loan-page-layout">
                    <div className="loan-summary" aria-label="Resumo de empréstimos">
                        <div className={overdueLoans.length ? "loan-summary-card warning" : "loan-summary-card"}>
                            <span>Atrasados</span>
                            <strong>{overdueLoans.length}</strong>
                            <small>{overdueLoans.length ? "Regularize assim que possível" : "Tudo em dia"}</small>
                        </div>
                        <div className="loan-summary-card">
                            <span>Em uso</span>
                            <strong>{activeLoans.length}</strong>
                            <small>Empréstimos ativos</small>
                        </div>
                        <div className="loan-summary-card">
                            <span>Concluídos</span>
                            <strong>{completedLoans.length}</strong>
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
                            }) : <div className="loan-empty-state">Você não possui empréstimos em andamento.</div>}
                        </div>
                    )}

                    <div className="loan-section-heading history-heading">
                        <div className="section-label">Histórico</div>
                        {historico.length > 0 && <span>{historico.length} registros</span>}
                    </div>

                    {!isLoading && !hasError && (
                        <div className="loan-history-list">
                            {historico.length ? historico.map((entry) => {
                                if (entry.kind === "loan") {
                                    return (
                                        <div className="loan-history-item" key={`loan-${entry.loan.id}`}>
                                            <div className="loan-history-icon completed">↵</div>
                                            <div>
                                                <span>Devolvido em {formatDate(entry.loan.actualReturnDate)}</span>
                                                <strong>{entry.loan.itemName}</strong>
                                                <small>{entry.loan.quantity} {entry.loan.quantity === 1 ? "unidade" : "unidades"}</small>
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <div className="loan-history-item" key={`movement-${entry.movement.id}`}>
                                        <div className="loan-history-icon consumption">−</div>
                                        <div>
                                            <span>Consumo em {formatDate(entry.movement.movementDate)}</span>
                                            <strong>{entry.movement.itemName}</strong>
                                            <small>{entry.movement.quantity} {entry.movement.quantity === 1 ? "unidade utilizada" : "unidades utilizadas"}{entry.movement.notes ? ` · ${entry.movement.notes}` : ""}</small>
                                        </div>
                                    </div>
                                );
                            }) : <div className="loan-empty-state">Nenhum registro no histórico.</div>}
                        </div>
                    )}
            </div>

            <Modal
                open={selectedLoan !== null}
                title={selectedLoan?.itemName ?? "Empréstimo"}
                subtitle={selectedLoan ? `${getLoanStatus(selectedLoan.status).label} · Retirado em ${formatDate(selectedLoan.checkoutDate)}` : undefined}
                closeLabel="Fechar"
                onClose={closeLoanModal}
                actions={
                    <div className="modal-actions-inline">
                        <div className="modal-btn primary" onClick={confirmReturn}>Confirmar devolução</div>
                        <div className="modal-btn danger" onClick={() => setDefectModalOpen(true)}>Relatar defeito</div>
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

            <DefectReportModal
                open={defectModalOpen}
                itemName={selectedLoan?.itemName ?? "item"}
                onClose={() => setDefectModalOpen(false)}
                onConfirm={handleDefectSubmit}
            />

            <Toast message={message} />
        </>
    );
}
