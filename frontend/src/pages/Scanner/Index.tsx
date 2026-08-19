import { useContext, useState } from "react";
import { ItemsContext } from "../../context/ItemsContext";
import ItemDetailsModal from "../../components/item/ItemDetailsModal";

const SCAN_IDLE = "Procurando algo para escanear...";

export default function Scanner() {
    const { items } = useContext(ItemsContext);
    const [status, setStatus] = useState(SCAN_IDLE);
    const [detailsIndex, setDetailsIndex] = useState<number | null>(null);

    function simulateScan() {
        setStatus("Lendo código...");

        setTimeout(() => {
            setStatus("Item encontrado!");
            setDetailsIndex(4);
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
                item={detailsIndex === null ? null : items[detailsIndex]}
                onClose={() => {
                    setDetailsIndex(null);
                    setStatus(SCAN_IDLE);
                }}
            />
        </div>
    );
}
