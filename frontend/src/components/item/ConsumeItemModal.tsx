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
    const [quantity, setQuantity] = useState("1");
    const [validationMessage, setValidationMessage] = useState("");

    useEffect(() => {
        if (!open) {
            setQuantity("1");
            setValidationMessage("");
        }
    }, [open]);

    function handleConfirm() {
        const requestedQuantity = Number(quantity);

        if (maxQuantity === 0) {
            setValidationMessage("Não há unidades disponíveis para consumo.");
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

        setValidationMessage("");
        onConfirm(requestedQuantity);
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
                    onChange={(event) => {
                        setQuantity(event.target.value);
                        setValidationMessage("");
                    }}
                    onBlur={() => {
                        if (quantity === "") setQuantity("0");
                    }}
                />
            </div>
            {validationMessage && <p className="form-error" role="alert">{validationMessage}</p>}
        </Modal>
    );
}
