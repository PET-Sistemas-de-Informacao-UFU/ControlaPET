import { useState } from "react";
import Modal from "../ui/Modal";

interface DefectReportModalProps {
    open: boolean
    itemName: string
    isSubmitting: boolean
    onClose: () => void
    onConfirm: (description: string) => void
}

export default function DefectReportModal({ open, itemName, isSubmitting, onClose, onConfirm }: DefectReportModalProps) {
    const [description, setDescription] = useState("");

    function handleConfirm(event: React.FormEvent) {
        event.preventDefault();
        if (description.trim() && !isSubmitting) onConfirm(description.trim());
    }

    return (
        <Modal open={open} title={`Relatar defeito — ${itemName}`} subtitle="Descreva o problema encontrado" closeLabel="Cancelar" onClose={() => !isSubmitting && onClose()}
            actions={<button type="submit" form="defect-report-form" className="modal-btn primary" disabled={isSubmitting || !description.trim()}>{isSubmitting ? "Enviando..." : "Enviar relato"}</button>}>
            <form id="defect-report-form" onSubmit={handleConfirm}>
                <div className="form-group">
                    <label htmlFor="defect-description">Descrição do defeito</label>
                    <textarea id="defect-description" required maxLength={3000} rows={4} placeholder="Descreva o que está acontecendo com o item..." value={description} disabled={isSubmitting} onChange={event => setDescription(event.target.value)} />
                </div>
            </form>
        </Modal>
    );
}
