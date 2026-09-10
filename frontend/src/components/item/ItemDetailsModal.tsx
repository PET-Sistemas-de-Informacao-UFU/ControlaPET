import Modal from "../ui/Modal";
import type { Item } from "../../interfaces/Item";

interface ItemDetailsModalProps {
    item: Item | null
    onClose: () => void
}

export default function ItemDetailsModal({ item, onClose }: ItemDetailsModalProps) {
    const typeLabels = {
        CONSUMABLE: "Consumível",
        BORROWABLE: "Emprestável",
        PERMANENT: "Permanente"
    };
    const conditionLabels = {
        NEW: "Novo",
        GOOD: "Bom",
        DAMAGED: "Danificado"
    };

    return (
        <Modal
            open={item !== null}
            title={item?.name ?? "Item"}
            subtitle={item ? `${item.stockQuantity} em estoque de ${item.totalQuantity}` : undefined}
            closeLabel="Fechar"
            onClose={onClose}
        >
            {item && (
                <div className="item-details">
                    <p>{item.description}</p>
                    <p><strong>Tipo:</strong> {typeLabels[item.type]}</p>
                    <p><strong>Condição:</strong> {conditionLabels[item.condition]}</p>
                </div>
            )}
        </Modal>
    );
}
