import { useEffect, useState } from "react";
import { useItemData, useAddItem, useUpdateItem, useDeleteItem } from "../../hooks/useItem";
import ItemDetailsModal from "../../components/item/ItemDetailsModal";
import ItemFormModal from "../../components/item/ItemFormModal";
import LoanRequestModal from "../../components/item/LoanRequestModal";
import ConsumeItemModal from "../../components/item/ConsumeItemModal";
import DefectReportModal from "../../components/item/DefectReportModal";
import Toast from "../../components/ui/Toast";
import { useToast } from "../../hooks/useToast";
import { useIsDesktop } from "../../hooks/useIsDesktop";
import type { CreateItemRequest } from "../../interfaces/Item";
import { useAddLoan } from "../../hooks/useLoan";
import { useConsumeItem } from "../../hooks/useMovement";
import { isAxiosError } from "axios";
import CatalogToolbar from "./CatalogToolbar";
import ItemList from "./ItemList";

export default function Catalogo() {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const { data, isLoading, isError } = useItemData(debouncedSearch);
    const addItemMutation = useAddItem();
    const updateItemMutation = useUpdateItem();
    const deleteItemMutation = useDeleteItem();
    const addLoanMutation = useAddLoan();
    const consumeItemMutation = useConsumeItem();
    const isDesktop = useIsDesktop();
    const { message, showToast } = useToast();

    const [detailsItemId, setDetailsItemId] = useState<number | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [editingItemId, setEditingItemId] = useState<number | null>(null);
    const [formKey, setFormKey] = useState(0);
    const [loanItemId, setLoanItemId] = useState<number | null>(null);
    const [consumeItemId, setConsumeItemId] = useState<number | null>(null);
    const [defectItemId, setDefectItemId] = useState<number | null>(null);

    const items = data?.content ?? [];
    const selectedItem = items.find((item) => item.id === detailsItemId) ?? null;
    const loanItem = items.find((item) => item.id === loanItemId) ?? null;
    const consumeItem = items.find((item) => item.id === consumeItemId) ?? null;
    const defectItem = items.find((item) => item.id === defectItemId) ?? null;

    useEffect(() => {
        const timeoutId = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
        return () => window.clearTimeout(timeoutId);
    }, [search]);

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

    function openConsumeModal(itemId: number) {
        setDetailsItemId(null);
        setConsumeItemId(itemId);
    }

    function getRequestErrorMessage(error: unknown, fallback: string) {
        if (isAxiosError<{ message?: string }>(error)) {
            return error.response?.data?.message ?? fallback;
        }

        return fallback;
    }

    function handleLoanConfirm(quantity: number, expectedReturnDate: string) {
        if (loanItemId === null) return;

        addLoanMutation.mutate(
            { itemId: loanItemId, quantity, expectedReturnDate },
            {
                onSuccess: () => {
                    setLoanItemId(null);
                    showToast("Empréstimo registrado");
                },
                onError: (error) => showToast(getRequestErrorMessage(error, "Não foi possível registrar o empréstimo"))
            }
        );
    }

    function handleConsumeConfirm(quantity: number) {
        if (consumeItemId === null) return;

        consumeItemMutation.mutate(
            { itemId: consumeItemId, quantity },
            {
                onSuccess: () => {
                    setConsumeItemId(null);
                    showToast("Consumo registrado");
                },
                onError: (error) => showToast(getRequestErrorMessage(error, "Não foi possível registrar o consumo"))
            }
        );
    }

    function handleDefectConfirm(description: string) {
        void description;
        setDefectItemId(null);
        showToast("Defeito reportado");
    }

    return (
        <>
            <CatalogToolbar
                isDesktop={isDesktop}
                search={search}
                onAdd={openAddModal}
                onSearchChange={setSearch}
            />

            {isError && <p>Erro ao carregar os itens.</p>}

            {!isLoading && !isError && (
                items.length > 0 ? (
                    <ItemList
                        items={items}
                        onOpen={setDetailsItemId}
                        onEdit={openEditModal}
                    />
                ) : (
                    <p className="catalog-empty">Nenhum item encontrado.</p>
                )
            )}

            <div className="fab-add" onClick={openAddModal} title="Adicionar item">+</div>

            <ItemDetailsModal
                item={selectedItem}
                onClose={() => setDetailsItemId(null)}
                onEmprestar={() => {
                    if (detailsItemId !== null) openLoanModal(detailsItemId);
                }}
                onConsumir={() => {
                    if (detailsItemId !== null) openConsumeModal(detailsItemId);
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
                maxQuantity={loanItem?.stockQuantity ?? 0}
                isSubmitting={addLoanMutation.isPending}
                onClose={() => setLoanItemId(null)}
                onConfirm={handleLoanConfirm}
            />

            <ConsumeItemModal
                open={consumeItem !== null}
                itemName={consumeItem?.name ?? ""}
                maxQuantity={consumeItem?.stockQuantity ?? 0}
                isSubmitting={consumeItemMutation.isPending}
                onClose={() => setConsumeItemId(null)}
                onConfirm={handleConsumeConfirm}
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
