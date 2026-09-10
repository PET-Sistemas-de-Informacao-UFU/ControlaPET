import { useState } from "react";
import ItemDetailsModal from "../../components/item/ItemDetailsModal";
import { useItemData } from "../../hooks/useItem";

const SCAN_IDLE = "Procurando algo para escanear...";

export default function Scanner() {
    const { data } = useItemData();
    const [status, setStatus] = useState(SCAN_IDLE);
    const [detailsItemId, setDetailsItemId] = useState<number | null>(null);
    const items = data?.content ?? [];

    function simulateScan() {
        setStatus("Lendo código...");

        setTimeout(() => {
            const item = items[0];

            if (!item) {
                setStatus("Nenhum item disponível para a simulação.");
                return;
            }

            setStatus("Item encontrado!");
            setDetailsItemId(item.id);
        }, 700);
    }

    return (
        <div className="scan-wrap">
            <div className="scan-frame">
                <div className="scan-corner tl"></div>
                <div className="scan-corner tr"></div>
                <div className="scan-corner bl"></div>
                <div className="scan-corner br"></div>
                <div className="scan-line"></div>
            </div>

            <div className="scan-status">{status}</div>
            <div className="scan-hint">Aponte a câmera para o Data Matrix impresso no equipamento.</div>
            <button className="scan-demo-btn" onClick={simulateScan}>Simular leitura</button>

            <ItemDetailsModal
                item={items.find((item) => item.id === detailsItemId) ?? null}
                onClose={() => {
                    setDetailsItemId(null);
                    setStatus(SCAN_IDLE);
                }}
            />
        </div>
    );
}
