import Modal from "../ui/Modal";
import type { Item } from "../../interfaces/Item";

interface ItemDetailsModalProps {
    item: Item | null
    onClose: () => void
    onEmprestar: () => void
    onRelatarDefeito: () => void
}

export default function ItemDetailsModal({ item, onClose, onEmprestar, onRelatarDefeito }: ItemDetailsModalProps) {
    return (
        <Modal
            open={item !== null}
            title={item?.name ?? "Item"}
            subtitle={item?.status ?? "Status"}
            closeLabel="Fechar"
            onClose={onClose}
            actions={
                <>
                    <div className="modal-btn primary" onClick={onEmprestar}>Emprestar</div>
                    <div className="modal-btn danger" onClick={onRelatarDefeito}>Relatar defeito</div>
                </>
            }
        />
    );
}
