import { useContext, useState } from "react";
import { useItemData, useAddItem, useUpdateItem, useDeleteItem } from "../../hooks/useItem";
import ItemCard from "../../components/item/ItemCard";
import ItemDetailsModal from "../../components/item/ItemDetailsModal";
import ItemFormModal from "../../components/item/ItemFormModal";
import { SearchIcon } from "../../components/ui/Icons";
import { useIsDesktop } from "../../hooks/useIsDesktop";
import type { Item } from "../../interfaces/Item";

export default function Catalogo() {
    const {data, isLoading, isError } = useItemData();
    const isDesktop = useIsDesktop();
    const [detailsItemId, setDetailsItemId] = useState<number | null>(null);
    const items = data?.content ?? [];
    const selectedItem = items.find((item) => item.id === detailsItemId) ?? null;
    const [formOpen, setFormOpen] = useState(false);
    const [editingItemId, setEditingItemId] = useState<number | null>(null);
    const [formKey, setFormKey] = useState(0);


    function openAddModal() {
        setEditingItemId(null);
        setFormKey((current) => current + 1);
        setFormOpen(true);
    }

    function openEditModal(itemId: number) {
        setEditingItemId(itemId);
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

            {isError && <p>Erro ao carregar os itens.</p>}

            {!isLoading && !isError && (
                <div className="catalog-grid">
                    {items.map((item) => (
                        <ItemCard
                            key={item.id}
                            item={item}
                            onOpen={() => setDetailsItemId(item.id)}
                            onEdit={() => openEditModal(item.id)}
                        />
                    ))}
                </div>
            )}

            <div className="fab-add" onClick={openAddModal} title="Adicionar item">+</div>

            <ItemDetailsModal
                item={selectedItem}
                onClose={() => setDetailsItemId(null)}
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
