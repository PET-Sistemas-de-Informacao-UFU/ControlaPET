import Modal from "../ui/Modal";
import ItemForm from "./ItemForm";
import type { Item } from "../../interfaces/Item";

interface ItemFormModalProps {
    open: boolean
    item: Item | null
    formKey: number
    onClose: () => void
    onSave: (item: Item) => void
    onDelete: () => void
}

export default function ItemFormModal({ open, item, formKey, onClose, onSave, onDelete }: ItemFormModalProps) {
    return (
        <Modal
            open={open}
            title={item ? "Editar item" : "Novo item"}
            subtitle="Preencha os dados do item"
            closeLabel="Cancelar"
            onClose={onClose}
        >
            <ItemForm key={formKey} item={item} onSave={onSave} onDelete={onDelete} />
        </Modal>
    );
}
