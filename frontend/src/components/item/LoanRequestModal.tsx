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
    const [quantity, setQuantity] = useState("1");
    const [expectedReturnDate, setExpectedReturnDate] = useState("");
    const [validationMessage, setValidationMessage] = useState("");

    useEffect(() => {
        if (!open) {
            setQuantity("1");
            setExpectedReturnDate("");
            setValidationMessage("");
        }
    }, [open]);

    function handleConfirm() {
        const requestedQuantity = Number(quantity);

        if (maxQuantity === 0) {
            setValidationMessage("Não há unidades disponíveis para empréstimo.");
            return;
        }

        if (!Number.isInteger(requestedQuantity) || requestedQuantity < 1) {
            setValidationMessage("Informe uma quantidade válida.");
            return;
        }

        if (requestedQuantity > maxQuantity) {
            setValidationMessage(`Há apenas ${maxQuantity} ${maxQuantity === 1 ? "unidade disponível" : "unidades disponíveis"}.`);
            return;
        }

        if (!expectedReturnDate) {
            setValidationMessage("Informe o prazo para devolução.");
            return;
        }

        setValidationMessage("");
        onConfirm(requestedQuantity, expectedReturnDate);
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
                    onChange={(event) => {
                        setQuantity(event.target.value);
                        setValidationMessage("");
                    }}
                    onBlur={() => {
                        if (quantity === "") setQuantity("0");
                    }}
                />
            </div>
            <div className="form-group">
                <label htmlFor="loan-req-return-date">Prazo para devolução</label>
                <input
                    type="date"
                    id="loan-req-return-date"
                    min={new Date().toISOString().slice(0, 10)}
                    value={expectedReturnDate}
                    onChange={(event) => {
                        setExpectedReturnDate(event.target.value);
                        setValidationMessage("");
                    }}
                />
            </div>
            {validationMessage && <p className="form-error" role="alert">{validationMessage}</p>}
        </Modal>
    );
}
