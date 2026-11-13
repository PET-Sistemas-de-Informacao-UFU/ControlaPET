import { useState } from "react";
import Modal from "../ui/Modal";

interface DefectReportModalProps {
    open: boolean
    itemName: string
    isSubmitting: boolean
    maxQuantity: number
    onClose: () => void
    onConfirm: (description: string, quantity: number) => void
}

export default function DefectReportModal({ open, itemName, isSubmitting, maxQuantity, onClose, onConfirm }: DefectReportModalProps) {
    const [quantity, setQuantity] = useState("1");
    const [description, setDescription] = useState("");

    function handleConfirm(event: React.FormEvent) {
        event.preventDefault();
        if (description.trim() && !isSubmitting && Number.isInteger(Number(quantity)) && Number(quantity) >= 1 && Number(quantity) <= maxQuantity) onConfirm(description.trim(), Number(quantity));
    }

    return (
        <Modal open={open} title={`Relatar defeito — ${itemName}`} subtitle="Descreva o problema encontrado" closeLabel="Cancelar" onClose={() => !isSubmitting && onClose()}
            actions={<button type="submit" form="defect-report-form" className="modal-btn primary" disabled={isSubmitting || !description.trim() || !Number.isInteger(Number(quantity)) || Number(quantity) < 1 || Number(quantity) > maxQuantity}>{isSubmitting ? "Enviando..." : "Enviar relato"}</button>}>
            <form id="defect-report-form" className="defect-close-form" onSubmit={handleConfirm}>
                <div className="form-group defect-quantity-field">
                    <label htmlFor="defect-quantity">Quantidade com defeito</label>
                    <div className="number-input">
                        <input id="defect-quantity" type="number" required min={1} max={maxQuantity} step={1} value={quantity} disabled={isSubmitting} onChange={event => setQuantity(event.target.value)} />
                        <div className="number-stepper">
                            <button type="button" aria-label="Aumentar quantidade" disabled={isSubmitting || Number(quantity) >= maxQuantity} onClick={() => setQuantity(current => String(Math.min(maxQuantity, Math.max(1, Number(current) + 1))))}>
                                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 15 6-6 6 6" /></svg>
                            </button>
                            <button type="button" aria-label="Diminuir quantidade" disabled={isSubmitting || Number(quantity) <= 1} onClick={() => setQuantity(current => String(Math.max(1, Math.min(maxQuantity, Number(current) - 1))))}>
                                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="defect-description">Descrição do defeito</label>
                    <textarea id="defect-description" required maxLength={3000} rows={4} placeholder="Descreva o que está acontecendo com o item..." value={description} disabled={isSubmitting} onChange={event => setDescription(event.target.value)} />
                </div>
            </form>
        </Modal>
    );
}
