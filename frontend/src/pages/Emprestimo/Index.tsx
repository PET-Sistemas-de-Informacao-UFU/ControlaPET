import { useState } from "react";
import Modal from "../../components/ui/Modal";
import DefectReportModal from "../../components/item/DefectReportModal";
import Toast from "../../components/ui/Toast";
import { useToast } from "../../hooks/useToast";
import { useUserLoans, useReturnLoan } from "../../hooks/useLoan";
import { useUserMovements } from "../../hooks/useMovement";
import type { Loan } from "../../interfaces/Loan";
import type { Movement } from "../../interfaces/Movement";

type FeedItem =
    | { kind: "loan"; loan: Loan }
    | { kind: "movement"; movement: Movement };

export default function Emprestimo() {
    const { data: loansPage } = useUserLoans();
    const { data: movementsPage } = useUserMovements();
    const returnLoan = useReturnLoan();
    const { message, showToast } = useToast();

    const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
    const [returnQty, setReturnQty] = useState(1);
    const [defectModalOpen, setDefectModalOpen] = useState(false);

    const loans = loansPage?.content ?? [];
    const consumos = (movementsPage?.content ?? []).filter((m) => m.type === "OUTBOUND_CONSUMPTION");

    const ativos = loans.filter((loan) => loan.status === "ACTIVE" || loan.status === "OVERDUE");

    const historico: FeedItem[] = [
        ...loans.filter((loan) => loan.status === "COMPLETED").map((loan) => ({ kind: "loan" as const, loan })),
        ...consumos.map((movement) => ({ kind: "movement" as const, movement })),
    ];

    function openLoanModal(loan: Loan) {
        setSelectedLoan(loan);
        setReturnQty(loan.quantity);
    }

    function closeLoanModal() {
        setSelectedLoan(null);
    }

    function confirmReturn() {
        if (!selectedLoan) return;

        // O back hoje só devolve o empréstimo inteiro (sem quantidade parcial).
        // Isso fica pendente para quando mexermos no back.
        if (returnQty !== selectedLoan.quantity) {
            alert("Devolução parcial ainda não é suportada pelo back-end. Devolvendo a quantidade total.");
        }

        returnLoan.mutate({ loanId: selectedLoan.id });
        showToast("Devolução concluída");
        closeLoanModal();
    }

    function handleDefectSubmit(_description: string) {
        // Ainda não existe endpoint de defeito no back — fica só no front por enquanto.
        setDefectModalOpen(false);
        showToast("Defeito reportado");
    }

    return (
        <>
            <div className="section-label">Ativos</div>
            <div className="audit-list">
                {ativos.length ? ativos.map((loan) => (
                    <div className="log-item" key={loan.id} onClick={() => openLoanModal(loan)}>
                        <div className="log-dotline">
                            <div className="log-dot" style={{ background: "var(--blue)" }}></div>
                            <div className="log-thread"></div>
                        </div>
                        <div className="log-body">
                            <div className="log-time"><b>EMPRÉSTIMO ATIVO</b> - {loan.checkoutDate}</div>
                            <div className="log-text"><b>{loan.itemName}</b> — {loan.quantity} un.</div>
                        </div>
                    </div>
                )) : (
                    <div style={{ padding: "20px", textAlign: "center", color: "#888" }}>
                        Nenhum empréstimo ativo.
                    </div>
                )}
            </div>

            <div className="section-label">Histórico</div>
            <div className="audit-list">
                {historico.length ? historico.map((entry) => {
                    if (entry.kind === "loan") {
                        const loan = entry.loan;
                        return (
                            <div className="log-item" key={`loan-${loan.id}`}>
                                <div className="log-dotline">
                                    <div className="log-dot" style={{ background: "var(--green)" }}></div>
                                    <div className="log-thread"></div>
                                </div>
                                <div className="log-body">
                                    <div className="log-time"><b>DEVOLVIDO</b> - {loan.actualReturnDate}</div>
                                    <div className="log-text"><b>{loan.itemName}</b> — {loan.quantity} un.</div>
                                </div>
                            </div>
                        );
                    }

                    const movement = entry.movement;
                    return (
                        <div className="log-item" key={`mov-${movement.id}`}>
                            <div className="log-dotline">
                                <div className="log-dot" style={{ background: "var(--orange)" }}></div>
                                <div className="log-thread"></div>
                            </div>
                            <div className="log-body">
                                <div className="log-time"><b>RETIRADA</b> - {movement.movementDate}</div>
                                <div className="log-text">
                                    <b>{movement.itemName}</b> — {movement.quantity} un.
                                    {movement.notes ? ` — ${movement.notes}` : ""}
                                </div>
                            </div>
                        </div>
                    );
                }) : (
                    <div style={{ padding: "20px", textAlign: "center", color: "#888" }}>
                        Nenhum histórico ainda.
                    </div>
                )}
            </div>

            <Modal
                open={selectedLoan !== null}
                title={selectedLoan?.itemName ?? "Empréstimo"}
                subtitle={selectedLoan ? `Emprestado em ${selectedLoan.checkoutDate}` : undefined}
                closeLabel="Fechar"
                onClose={closeLoanModal}
                actions={
                    <>
                        <div className="modal-btn primary" onClick={confirmReturn}>Confirmar devolução</div>
                        <div className="modal-btn danger" onClick={() => setDefectModalOpen(true)}>Relatar defeito</div>
                    </>
                }
            >
                <div className="form-group">
                    <label htmlFor="loan-return-qty">Quantidade a devolver</label>
                    <input
                        type="number"
                        id="loan-return-qty"
                        min={1}
                        max={selectedLoan?.quantity ?? 1}
                        value={returnQty}
                        onChange={(event) => setReturnQty(Number(event.target.value))}
                    />
                </div>
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
