import { useState } from "react";
import Modal from "../ui/Modal";

interface DefectReportModalProps {
    open: boolean
    itemName: string
    onClose: () => void
    onConfirm: (description: string) => void
}

export default function DefectReportModal({ open, itemName, onClose, onConfirm }: DefectReportModalProps) {
    const [description, setDescription] = useState("");

    function handleConfirm() {
        onConfirm(description);
        setDescription("");
    }

    return (
        <Modal
            open={open}
            title={`Relatar defeito — ${itemName}`}
            subtitle="Descreva o problema encontrado"
            closeLabel="Cancelar"
            onClose={onClose}
            actions={<div className="modal-btn danger" onClick={handleConfirm}>Enviar relato</div>}
        >
            <div className="form-group">
                <label htmlFor="defect-description">Descrição do defeito</label>
                <textarea
                    id="defect-description"
                    rows={4}
                    placeholder="Descreva o que está acontecendo com o item..."
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                />
            </div>
        </Modal>
    );
}
