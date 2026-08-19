import Modal from "../ui/Modal";
import type { Item } from "../../interfaces/Item";

interface ItemDetailsModalProps {
    item: Item | null
    onClose: () => void
}

export default function ItemDetailsModal({ item, onClose }: ItemDetailsModalProps) {
    return (
        <Modal
            open={item !== null}
            title={item?.name ?? "Item"}
            subtitle={item?.status ?? "Status"}
            closeLabel="Fechar"
            onClose={onClose}
            actions={
                <>
                    <div className="modal-btn primary">Emprestar</div>
                    <div className="modal-btn">Devolver</div>
                    <div className="modal-btn danger">Relatar defeito</div>
                </>
            }
        />
    );
}
