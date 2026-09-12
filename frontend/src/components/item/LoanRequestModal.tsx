import { useEffect, useState } from "react";
import Modal from "../ui/Modal";

interface LoanRequestModalProps {
    open: boolean
    itemName: string
    maxQuantity: number
    isSubmitting: boolean
    onClose: () => void
    onConfirm: (quantity: number, expectedReturnDate: string) => void
}

export default function LoanRequestModal({ open, itemName, maxQuantity, isSubmitting, onClose, onConfirm }: LoanRequestModalProps) {
    const [quantity, setQuantity] = useState(1);
    const [expectedReturnDate, setExpectedReturnDate] = useState("");

    useEffect(() => {
        if (!open) {
            setQuantity(1);
            setExpectedReturnDate("");
        }
    }, [open]);

    function handleConfirm() {
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > maxQuantity || !expectedReturnDate) return;
        onConfirm(quantity, expectedReturnDate);
    }

    return (
        <Modal
            open={open}
            title={`Emprestar ${itemName}`}
            subtitle="Informe a quantidade e a data prevista para devolução"
            sheetClassName="modal-sheet-compact"
            closeLabel="Cancelar"
            onClose={onClose}
            actions={<button type="button" className="modal-btn primary" disabled={isSubmitting} onClick={handleConfirm}>{isSubmitting ? "Registrando..." : "Confirmar empréstimo"}</button>}
        >
            <div className="form-group">
                <label htmlFor="loan-req-qty">Quantidade</label>
                <input
                    type="number"
                    id="loan-req-qty"
                    min={1}
                    max={maxQuantity}
                    value={quantity}
                    onChange={(event) => setQuantity(Number(event.target.value))}
                />
            </div>
            <div className="form-group">
                <label htmlFor="loan-req-return-date">Prazo para devolução</label>
                <input
                    type="date"
                    id="loan-req-return-date"
                    min={new Date().toISOString().slice(0, 10)}
                    value={expectedReturnDate}
                    onChange={(event) => setExpectedReturnDate(event.target.value)}
                />
            </div>
        </Modal>
    );
}
