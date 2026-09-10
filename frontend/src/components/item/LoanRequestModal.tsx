import { useState } from "react";
import Modal from "../ui/Modal";

interface LoanRequestModalProps {
    open: boolean
    itemName: string
    onClose: () => void
    onConfirm: (quantity: number, notes: string) => void
}

export default function LoanRequestModal({ open, itemName, onClose, onConfirm }: LoanRequestModalProps) {
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState("");

    function handleConfirm() {
        onConfirm(quantity, notes);
        setQuantity(1);
        setNotes("");
    }

    return (
        <Modal
            open={open}
            title={`Emprestar ${itemName}`}
            subtitle="Informe a quantidade e o motivo do empréstimo"
            closeLabel="Cancelar"
            onClose={onClose}
            actions={<div className="modal-btn primary" onClick={handleConfirm}>Confirmar empréstimo</div>}
        >
            <div className="form-group">
                <label htmlFor="loan-req-qty">Quantidade</label>
                <input
                    type="number"
                    id="loan-req-qty"
                    min={1}
                    value={quantity}
                    onChange={(event) => setQuantity(Number(event.target.value))}
                />
            </div>
            <div className="form-group">
                <label htmlFor="loan-req-notes">Motivo / observação</label>
                <input
                    type="text"
                    id="loan-req-notes"
                    placeholder="Ex: Vou usar na apresentação de projeto"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                />
            </div>
        </Modal>
    );
}
