import ItemCard from "../../components/item/ItemCard";
import type { Item } from "../../interfaces/Item";

interface ItemListProps {
    items: Item[]
    onOpen: (itemId: number) => void
    onEdit: (itemId: number) => void
}

export default function ItemList({ items, onOpen, onEdit }: ItemListProps) {
    return (
        <div className="catalog-grid">
            {items.map((item) => (
                <ItemCard
                    key={item.id}
                    item={item}
                    onOpen={() => onOpen(item.id)}
                    onEdit={() => onEdit(item.id)}
                />
            ))}
        </div>
    );
}
