import { useState } from "react";
import type { Item } from "../../interfaces/Item";

interface ItemFormProps {
    item: Item | null
    onSave: (item: Item) => void
    onDelete: () => void
}

export default function ItemForm({ item, onSave, onDelete }: ItemFormProps) {
    const [emoji, setEmoji] = useState(item?.emoji ?? "");
    const [name, setName] = useState(item?.name ?? "");
    const [qty, setQty] = useState(item ? String(parseInt(item.qty) || "") : "");
    const [status, setStatus] = useState(item?.status ?? "");

    function handleSave() {
        const trimmedName = name.trim();
        const trimmedQty = qty.trim();

        if (!trimmedName || !trimmedQty) {
            alert("Preencha ao menos o nome e a quantidade.");
            return;
        }

        onSave({
            emoji: emoji.trim() || "📦",
            name: trimmedName,
            qty: `${trimmedQty} Un.`,
            status: status.trim() || `Disponível — ${trimmedQty} unidades em estoque.`
        });
    }

    function handleDelete() {
        if (item && confirm(`Excluir "${item.name}" do catálogo?`)) {
            onDelete();
        }
    }

    return (
        <>
            <div className="form-group">
                <label htmlFor="edit-emoji">Emoji</label>
                <input
                    type="text"
                    id="edit-emoji"
                    placeholder="📦"
                    maxLength={2}
                    value={emoji}
                    onChange={(event) => setEmoji(event.target.value)}
                />
            </div>

            <div className="form-group">
                <label htmlFor="edit-name">Nome do item</label>
                <input
                    type="text"
                    id="edit-name"
                    placeholder="Ex: Cabo USB-C"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                />
            </div>

            <div className="form-group">
                <label htmlFor="edit-qty">Quantidade</label>
                <input
                    type="number"
                    id="edit-qty"
                    placeholder="Ex: 5"
                    min="0"
                    value={qty}
                    onChange={(event) => setQty(event.target.value)}
                />
            </div>

            <div className="form-group">
                <label htmlFor="edit-status">Status / observação</label>
                <input
                    type="text"
                    id="edit-status"
                    placeholder="Ex: Disponível no armário PET"
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                />
            </div>

            <div className="modal-actions">
                <div className="modal-btn primary" onClick={handleSave}>Salvar</div>
                {item && <div className="modal-btn danger" onClick={handleDelete}>Excluir item</div>}
            </div>
        </>
    );
}
