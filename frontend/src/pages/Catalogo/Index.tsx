import { useState } from "react";
import { useItemData, useAddItem, useUpdateItem, useDeleteItem } from "../../hooks/useItem";
import ItemDetailsModal from "../../components/item/ItemDetailsModal";
import ItemFormModal from "../../components/item/ItemFormModal";
import LoanRequestModal from "../../components/item/LoanRequestModal";
import DefectReportModal from "../../components/item/DefectReportModal";
import Toast from "../../components/ui/Toast";
import { useToast } from "../../hooks/useToast";
import { useIsDesktop } from "../../hooks/useIsDesktop";
import type { CreateItemRequest } from "../../interfaces/Item";
import CatalogToolbar from "./CatalogToolbar";
import ItemList from "./ItemList";

export default function Catalogo() {
    const { data, isLoading, isError } = useItemData();
    const addItemMutation = useAddItem();
    const updateItemMutation = useUpdateItem();
    const deleteItemMutation = useDeleteItem();
    const isDesktop = useIsDesktop();
    const { message, showToast } = useToast();

    const [detailsItemId, setDetailsItemId] = useState<number | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [editingItemId, setEditingItemId] = useState<number | null>(null);
    const [formKey, setFormKey] = useState(0);
    const [loanItemId, setLoanItemId] = useState<number | null>(null);
    const [defectItemId, setDefectItemId] = useState<number | null>(null);

    const items = data?.content ?? [];
    const selectedItem = items.find((item) => item.id === detailsItemId) ?? null;
    const loanItem = items.find((item) => item.id === loanItemId) ?? null;
    const defectItem = items.find((item) => item.id === defectItemId) ?? null;

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
                { itemId: editingItemId, data },
                { onSuccess: () => setFormOpen(false) }
            );
        }
    }

    function handleDelete() {
        if (editingItemId === null) return;

        deleteItemMutation.mutate(editingItemId, {
            onSuccess: () => setFormOpen(false)
        });
    }

    function openLoanModal(itemId: number) {
        setDetailsItemId(null);
        setLoanItemId(itemId);
    }

    function openDefectModal(itemId: number) {
        setDetailsItemId(null);
        setDefectItemId(itemId);
    }

    function handleLoanConfirm(quantity: number, notes: string) {
        void quantity;
        void notes;
        setLoanItemId(null);
        showToast("Empréstimo solicitado");
    }

    function handleDefectConfirm(description: string) {
        void description;
        setDefectItemId(null);
        showToast("Defeito reportado");
    }

    return (
        <>
            <CatalogToolbar isDesktop={isDesktop} onAdd={openAddModal} />

            {isError && <p>Erro ao carregar os itens.</p>}

            {!isLoading && !isError && (
                <ItemList
                    items={items}
                    onOpen={setDetailsItemId}
                    onEdit={openEditModal}
                />
            )}

            <div className="fab-add" onClick={openAddModal} title="Adicionar item">+</div>

            <ItemDetailsModal
                item={selectedItem}
                onClose={() => setDetailsItemId(null)}
                onEmprestar={() => {
                    if (detailsItemId !== null) openLoanModal(detailsItemId);
                }}
                onRelatarDefeito={() => {
                    if (detailsItemId !== null) openDefectModal(detailsItemId);
                }}
            />

            <ItemFormModal
                open={formOpen}
                formKey={formKey}
                item={editingItemId === null
                    ? null
                    : items.find((item) => item.id === editingItemId) ?? null}
                onClose={() => setFormOpen(false)}
                onSave={handleSave}
                onDelete={handleDelete}
            />

            <LoanRequestModal
                open={loanItem !== null}
                itemName={loanItem?.name ?? ""}
                onClose={() => setLoanItemId(null)}
                onConfirm={handleLoanConfirm}
            />

            <DefectReportModal
                open={defectItem !== null}
                itemName={defectItem?.name ?? ""}
                onClose={() => setDefectItemId(null)}
                onConfirm={handleDefectConfirm}
            />

            <Toast message={message} />
        </>
    );
}
