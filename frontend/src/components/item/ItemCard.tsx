import type { Item } from "../../interfaces/Item";
import { ChevronIcon, EditIcon } from "../ui/Icons";

interface ItemCardProps {
    item: Item
    onOpen: () => void
    onEdit: () => void
    canManageItems: boolean
}

export default function ItemCard({ item, onOpen, onEdit, canManageItems }: ItemCardProps) {
    const typeLabel = { CONSUMABLE: "Consumo", BORROWABLE: "Empréstimo", PERMANENT: "Permanente" }[item.type];
    const unitLabel = item.totalQuantity === 1 ? "unidade" : "unidades";

    return (
        <div className="item-card">
            <button type="button" className="item-info" onClick={onOpen}>
                <span className="item-category">{typeLabel}</span>
                <span className="name">{item.name}</span>
                <span className="qty item-stock-summary">
                    {item.stockQuantity} de {item.totalQuantity} {unitLabel} em estoque
                </span>
            </button>

            {canManageItems && (
                <button
                    type="button"
                    className="item-edit-btn"
                    aria-label={`Editar ${item.name}`}
                    onClick={onEdit}
                >
                    <EditIcon />
                </button>
            )}

            <span className="item-arrow" aria-hidden="true">
                <ChevronIcon />
            </span>
        </div>
    );
}
