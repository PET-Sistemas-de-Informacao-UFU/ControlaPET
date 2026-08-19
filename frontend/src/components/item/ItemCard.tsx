import type { Item } from "../../interfaces/Item";
import { ChevronIcon, EditIcon } from "../ui/Icons";

interface ItemCardProps {
    item: Item
    onOpen: () => void
    onEdit: () => void
}

export default function ItemCard({ item, onOpen, onEdit }: ItemCardProps) {
    return (
        <div className="item-card">
            <div className="item-thumb" onClick={onOpen}>{item.emoji}</div>

            <div className="item-info" onClick={onOpen}>
                <div className="name">{item.name}</div>
                <div className="qty">{item.qty}</div>
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
