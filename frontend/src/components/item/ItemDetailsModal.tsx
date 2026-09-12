import Modal from "../ui/Modal";
import type { Item } from "../../interfaces/Item";

interface ItemDetailsModalProps {
    item: Item | null
    onClose: () => void
    onEmprestar: () => void
    onRelatarDefeito: () => void
}

export default function ItemDetailsModal({ item, onClose, onEmprestar, onRelatarDefeito }: ItemDetailsModalProps) {
    const unitLabel = item?.totalQuantity === 1 ? "unidade" : "unidades";
    const typeLabels = {
        CONSUMABLE: "Consumível",
        BORROWABLE: "Emprestável",
        PERMANENT: "Permanente"
    };
    const conditionLabels = {
        NEW: "Novo",
        GOOD: "Bom",
        DAMAGED: "Danificado"
    };

    return (
        <Modal
            open={item !== null}
            title={item?.name ?? "Item"}
            subtitle={item ? `${item.stockQuantity} de ${item.totalQuantity} ${unitLabel} em estoque` : undefined}
            subtitleClassName="item-stock-summary"
            sheetClassName="modal-sheet-compact"
            closeLabel="Fechar"
            onClose={onClose}
            actions={
                <div className="modal-actions-inline">
                    {item?.type === "BORROWABLE" && (
                        <div className="modal-btn primary" onClick={onEmprestar}>
                            Registrar empréstimo
                        </div>
                    )}
                    {item?.type === "CONSUMABLE" && (
                        <div className="modal-btn primary">Registrar consumo</div>
                    )}
                    <div className="modal-btn danger" onClick={onRelatarDefeito}>
                        Reportar defeito
                    </div>
                </div>
            }
        >
            {item && (
                <div className="item-details">
                    <p className="item-description">{item.description}</p>

                    <div className="item-metadata">
                        <div>
                            <span>Tipo</span>
                            <strong>{typeLabels[item.type]}</strong>
                        </div>
                        <div>
                            <span>Condição</span>
                            <strong>{conditionLabels[item.condition]}</strong>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
}
