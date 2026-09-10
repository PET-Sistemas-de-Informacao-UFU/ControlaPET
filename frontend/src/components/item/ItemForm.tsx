import { useState } from "react";
import type {
    CreateItemRequest,
    Item,
    ItemCondition,
    ItemType
} from "../../interfaces/Item";

interface ItemFormProps {
    item: Item | null
    onSave: (data: CreateItemRequest) => void
    onDelete: () => void
}

export default function ItemForm({ item, onSave, onDelete }: ItemFormProps) {
    const [name, setName] = useState(item?.name ?? "");
    const [description, setDescription] = useState(item?.description ?? "");
    const [type, setType] = useState<ItemType | "">(item?.type ?? "");
    const [condition, setCondition] = useState<ItemCondition | "">(item?.condition ?? "");
    const [totalQuantity, setTotalQuantity] = useState(
        item ? String(item.totalQuantity) : ""
    );

    function handleSave() {
        const trimmedName = name.trim();
        const trimmedDescription = description.trim();
        const quantity = Number(totalQuantity);

        if (!trimmedName || !trimmedDescription || !type || !condition) {
            alert("Preencha todos os campos obrigatórios.");
            return;
        }

        if (!Number.isInteger(quantity) || quantity < 0) {
            alert("Informe uma quantidade válida.");
            return;
        }

        onSave({
            name: trimmedName,
            description: trimmedDescription,
            type,
            condition,
            totalQuantity: quantity
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
                <label htmlFor="edit-description">Descrição</label>
                <textarea
                    id="edit-description"
                    placeholder="Descrição do item"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                />
            </div>

            <div className="form-group">
                <label htmlFor="edit-type">Tipo</label>
                <select
                    id="edit-type"
                    value={type}
                    onChange={(event) => setType(event.target.value as ItemType | "")}
                >
                    <option value="">Selecione o tipo</option>
                    <option value="CONSUMABLE">Consumível</option>
                    <option value="BORROWABLE">Emprestável</option>
                    <option value="PERMANENT">Permanente</option>
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="edit-total-quantity">Quantidade total</label>
                <input
                    type="number"
                    id="edit-total-quantity"
                    placeholder="Ex: 5"
                    min="0"
                    value={totalQuantity}
                    onChange={(event) => setTotalQuantity(event.target.value)}
                />
            </div>

            <div className="form-group">
                <label htmlFor="edit-condition">Condição</label>
                <select
                    id="edit-condition"
                    value={condition}
                    onChange={(event) => setCondition(event.target.value as ItemCondition | "")}
                >
                    <option value="">Selecione a condição</option>
                    <option value="NEW">Novo</option>
                    <option value="GOOD">Bom</option>
                    <option value="DAMAGED">Danificado</option>
                </select>
            </div>

            <div className="modal-actions">
                <div className="modal-btn primary" onClick={handleSave}>Salvar</div>
                {item && <div className="modal-btn danger" onClick={handleDelete}>Excluir item</div>}
            </div>
        </>
    );
}
