import { useEffect, useState } from "react";
import Modal from "../ui/Modal";

interface ConsumeItemModalProps {
    open: boolean
    itemName: string
    maxQuantity: number
    isSubmitting: boolean
    onClose: () => void
    onConfirm: (quantity: number) => void
}

export default function ConsumeItemModal({ open, itemName, maxQuantity, isSubmitting, onClose, onConfirm }: ConsumeItemModalProps) {
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (!open) setQuantity(1);
    }, [open]);

    function handleConfirm() {
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > maxQuantity) return;
        onConfirm(quantity);
    }

    return (
        <Modal
            open={open}
            title={`Consumir ${itemName}`}
            subtitle="Informe a quantidade que será consumida"
            sheetClassName="modal-sheet-compact"
            closeLabel="Cancelar"
            onClose={onClose}
            actions={<button type="button" className="modal-btn primary" disabled={isSubmitting} onClick={handleConfirm}>{isSubmitting ? "Registrando..." : "Confirmar consumo"}</button>}
        >
            <div className="form-group">
                <label htmlFor="consume-req-qty">Quantidade</label>
                <input
                    type="number"
                    id="consume-req-qty"
                    min={1}
                    max={maxQuantity}
                    value={quantity}
                    onChange={(event) => setQuantity(Number(event.target.value))}
                />
            </div>
        </Modal>
    );
}
