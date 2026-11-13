import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import DefectReportList from "./DefectReportList";
import Modal from "../ui/Modal";
import type { Item } from "../../interfaces/Item";

interface ItemDetailsModalProps {
    item: Item | null
    onClose: () => void
    onEmprestar: () => void
    onConsumir: () => void
    onRelatarDefeito: () => void
}

export default function ItemDetailsModal({ item, onClose, onEmprestar, onConsumir, onRelatarDefeito }: ItemDetailsModalProps) {
    const { user } = useContext(AuthContext);
    const canManageReports = user?.role === "ADMIN";
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
            sheetClassName="modal-sheet-compact item-details-sheet"
            closeLabel="Fechar"
            onClose={onClose}
            actions={
                <div className="modal-actions-inline">
                    <button type="button" className="modal-btn danger" onClick={onRelatarDefeito}>
                        Relatar defeito
                    </button>
                    {item?.type === "BORROWABLE" && (
                        <div className="modal-btn primary" onClick={onEmprestar}>
                            Registrar empréstimo
                        </div>
                    )}
                    {item?.type === "CONSUMABLE" && (
                        <div className="modal-btn primary" onClick={onConsumir}>Registrar consumo</div>
                    )}
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
                    {item.maintenanceQuantity > 0 && <p className="item-maintenance-summary">{item.maintenanceQuantity} {item.maintenanceQuantity === 1 ? "unidade bloqueada por defeito" : "unidades bloqueadas por defeito"}</p>}
                    {canManageReports && <DefectReportList key={item.id} itemId={item.id} />}
                </div>
            )}
        </Modal>
    );
}
