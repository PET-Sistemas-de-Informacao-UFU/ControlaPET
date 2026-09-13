import type { Item } from "../../interfaces/Item";
import { ChevronIcon, EditIcon } from "../ui/Icons";

interface ItemCardProps {
    item: Item
    onOpen: () => void
    onEdit: () => void
}

export default function ItemCard({ item, onOpen, onEdit }: ItemCardProps) {
    const typeInitial = item.type.charAt(0);
    const unitLabel = item.totalQuantity === 1 ? "unidade" : "unidades";

    return (
        <div className="item-card">
            <div className="item-thumb" onClick={onOpen}>{typeInitial}</div>

            <div className="item-info" onClick={onOpen}>
                <div className="name">{item.name}</div>
                <div className="qty item-stock-summary">
                    {item.stockQuantity} de {item.totalQuantity} {unitLabel} em estoque
                </div>
            </div>

            <div
                className="item-edit-btn"
                onClick={(event) => {
                    event.stopPropagation();
                    onEdit();
                }}
            >
                <EditIcon />
            </div>

            <div className="item-arrow" onClick={onOpen}>
                <ChevronIcon />
            </div>
        </div>
    );
}
