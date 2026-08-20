import { useContext, useState } from "react";
import { ItemsContext } from "../../context/ItemsContext";
import ItemCard from "../../components/item/ItemCard";
import ItemDetailsModal from "../../components/item/ItemDetailsModal";
import ItemFormModal from "../../components/item/ItemFormModal";
import { SearchIcon } from "../../components/ui/Icons";
import { useIsDesktop } from "../../hooks/useIsDesktop";
import type { Item } from "../../interfaces/Item";

export default function Catalogo() {
    const { items, addItem, updateItem, removeItem } = useContext(ItemsContext);
    const isDesktop = useIsDesktop();
    const [detailsIndex, setDetailsIndex] = useState<number | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [formKey, setFormKey] = useState(0);

    function openAddModal() {
        setEditingIndex(null);
        setFormKey((current) => current + 1);
        setFormOpen(true);
    }

    function openEditModal(index: number) {
        setEditingIndex(index);
        setFormKey((current) => current + 1);
        setFormOpen(true);
    }

    function handleSave(item: Item) {
        if (editingIndex === null) {
            addItem(item);
        } else {
            updateItem(editingIndex, item);
        }

        setFormOpen(false);
    }

    function handleDelete() {
        if (editingIndex !== null) {
            removeItem(editingIndex);
            setFormOpen(false);
        }
    }

    return (
        <>
            <div className="catalog-toolbar">
                <div className="search-bar"><SearchIcon /><span>Procurar...</span></div>

                {isDesktop && (
                    <button type="button" className="header-btn" onClick={openAddModal}>
                        + Novo item
                    </button>
                )}
            </div>

            {!isDesktop && <div className="section-label">Itens do catálogo</div>}

            <div className="catalog-grid">
                {items.map((item, index) => (
                    <ItemCard
                        key={index}
                        item={item}
                        onOpen={() => setDetailsIndex(index)}
                        onEdit={() => openEditModal(index)}
                    />
                ))}
            </div>

            <div className="fab-add" onClick={openAddModal} title="Adicionar item">+</div>

            <ItemDetailsModal
                item={detailsIndex === null ? null : items[detailsIndex]}
                onClose={() => setDetailsIndex(null)}
            />

            <ItemFormModal
                open={formOpen}
                formKey={formKey}
                item={editingIndex === null ? null : items[editingIndex]}
                onClose={() => setFormOpen(false)}
                onSave={handleSave}
                onDelete={handleDelete}
            />
        </>
    );
}
