import type { Item } from "../../interfaces/Item";
import { ChevronIcon, EditIcon } from "../ui/Icons";

interface ItemCardProps {
    item: Item
    onOpen: () => void
    onEdit: () => void
}

export default function ItemCard({ item, onOpen, onEdit }: ItemCardProps) {
    const typeInitial = item.type.charAt(0);

    return (
        <div className="item-card">
            <div className="item-thumb" onClick={onOpen}>{typeInitial}</div>

            <div className="item-info" onClick={onOpen}>
                <div className="name">{item.name}</div>
                <div className="qty">
                    {item.stockQuantity} em estoque de {item.totalQuantity}
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
