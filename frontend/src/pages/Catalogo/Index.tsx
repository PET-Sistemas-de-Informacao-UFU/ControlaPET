import { useState } from "react";
import { useItemData, useAddItem, useUpdateItem, useDeleteItem } from "../../hooks/useItem";
import ItemCard from "../../components/item/ItemCard";
import ItemDetailsModal from "../../components/item/ItemDetailsModal";
import ItemFormModal from "../../components/item/ItemFormModal";
import { SearchIcon } from "../../components/ui/Icons";
import { useIsDesktop } from "../../hooks/useIsDesktop";
import type { CreateItemRequest } from "../../interfaces/Item";

export default function Catalogo() {
    const {data, isLoading, isError } = useItemData();
    const addItemMutation = useAddItem();
    const updateItemMutation = useUpdateItem();
    const deleteItemMutation = useDeleteItem();

    const isDesktop = useIsDesktop();

    const [detailsItemId, setDetailsItemId] = useState<number | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [editingItemId, setEditingItemId] = useState<number | null>(null);
    const [formKey, setFormKey] = useState(0);

    const items = data?.content ?? [];
    const selectedItem = items.find((item) => item.id === detailsItemId) ?? null;


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

    function handleSave(data: CreateItemRequest) {
        if (editingItemId === null) {
            addItemMutation.mutate(data, {
                onSuccess: () => setFormOpen(false)
            });
        } else {
            updateItemMutation.mutate(
                {
                    itemId: editingItemId,
                    data
                },
                {
                    onSuccess: () => setFormOpen(false)
                }
            );
        }
    }

    function handleDelete() {
        if (editingItemId === null) {
            return;
        }

        deleteItemMutation.mutate(editingItemId, {
            onSuccess: () => setFormOpen(false)
        });
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
                item={editingItemId === null ? null
                    : items.find((item) => item.id === editingItemId) ?? null }
                onClose={() => setFormOpen(false)}
                onSave={handleSave}
                onDelete={handleDelete}
            />
        </>
    );
}
