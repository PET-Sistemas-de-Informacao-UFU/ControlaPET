import { useState } from "react";
import type {
    CreateItemRequest,
    Item,
    ItemCondition,
    ItemType
} from "../../interfaces/Item";
import FormSelect from "../ui/FormSelect";

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

    function changeQuantity(amount: number) {
        const currentQuantity = Number(totalQuantity) || 0;
        setTotalQuantity(String(Math.max(0, currentQuantity + amount)));
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

            <div className="item-form-details">
                <div className="form-group">
                    <label htmlFor="edit-type">Tipo</label>
                    <FormSelect
                        id="edit-type"
                        value={type}
                        placeholder="Selecione o tipo"
                        options={[
                            { value: "CONSUMABLE", label: "Consumível" },
                            { value: "BORROWABLE", label: "Emprestável" },
                            { value: "PERMANENT", label: "Permanente" }
                        ]}
                        onChange={(value) => setType(value as ItemType)}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="edit-total-quantity">Quantidade total</label>
                    <div className="number-input">
                        <input
                            type="number"
                            id="edit-total-quantity"
                            placeholder="Ex: 5"
                            min="0"
                            value={totalQuantity}
                            onChange={(event) => setTotalQuantity(event.target.value)}
                        />
                        <div className="number-stepper">
                            <button type="button" aria-label="Aumentar quantidade" onClick={() => changeQuantity(1)}>
                                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 15 6-6 6 6" /></svg>
                            </button>
                            <button type="button" aria-label="Diminuir quantidade" onClick={() => changeQuantity(-1)}>
                                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="edit-condition">Condição</label>
                    <FormSelect
                        id="edit-condition"
                        value={condition}
                        placeholder="Selecione a condição"
                        options={[
                            { value: "NEW", label: "Novo" },
                            { value: "GOOD", label: "Bom" },
                            { value: "DAMAGED", label: "Danificado" }
                        ]}
                        onChange={(value) => setCondition(value as ItemCondition)}
                    />
                </div>
            </div>

            <div className={item ? "modal-actions item-form-actions" : "modal-actions"}>
                <div className="modal-btn primary" onClick={handleSave}>Salvar</div>
                {item && <div className="modal-btn danger" onClick={handleDelete}>Excluir item</div>}
            </div>
        </>
    );
}
