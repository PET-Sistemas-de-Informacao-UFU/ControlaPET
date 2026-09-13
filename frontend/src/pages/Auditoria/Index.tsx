import { useState } from "react";
import Modal from "../../components/ui/Modal";
import { FilterIcon } from "../../components/ui/Icons";
import { useIsDesktop } from "../../hooks/useIsDesktop";
import type { AuditFilter, Log } from "../../interfaces/Log";

const LOGS: Log[] = [];

export default function Auditoria() {
    const isDesktop = useIsDesktop();
    const [filter, setFilter] = useState<AuditFilter>({ date: null, name: null });
    const [searchOpen, setSearchOpen] = useState(false);
    const [dateInput, setDateInput] = useState("");
    const [nameInput, setNameInput] = useState("");

    const filtered = LOGS.filter((log) => {
        const matchesDate = !filter.date || log.date === filter.date;
        const matchesName = !filter.name || log.who.toLowerCase().includes(filter.name.toLowerCase());

        return matchesDate && matchesName;
    });

    function openSearchModal() {
        setDateInput(filter.date ?? "");
        setNameInput(filter.name ?? "");
        setSearchOpen(true);
    }

    function applyFilter() {
        setFilter({ date: dateInput || null, name: nameInput.trim() || null });
        setSearchOpen(false);
    }

    function clearFilter() {
        setFilter({ date: null, name: null });
        setDateInput("");
        setNameInput("");
        setSearchOpen(false);
    }

    const fields = (
        <>
            <div className="form-group">
                <label htmlFor="audit-search-date">Data</label>
                <input
                    type="date"
                    id="audit-search-date"
                    value={dateInput}
                    onChange={(event) => setDateInput(event.target.value)}
                />
            </div>

            <div className="form-group">
                <label htmlFor="audit-search-name">Nome</label>
                <input
                    type="text"
                    id="audit-search-name"
                    placeholder="Ex: Thiago"
                    value={nameInput}
                    onChange={(event) => setNameInput(event.target.value)}
                />
            </div>
        </>
    );

    return (
        <>
            {isDesktop ? (
                <div className="audit-filters">
                    {fields}
                    <button type="button" className="header-btn" onClick={applyFilter}>Buscar</button>
                    <button type="button" className="header-btn ghost" onClick={clearFilter}>Limpar</button>
                </div>
            ) : (
                <div className="search-bar" onClick={openSearchModal}>
                    <FilterIcon /><span>Pesquisar / Filtrar...</span>
                </div>
            )}

            <div className="section-label">Movimentações</div>

            <div className="audit-list">
                {filtered.length ? filtered.map((log, index) => (
                    <div className="log-item" key={index}>
                        <div className="log-dotline">
                            <div className="log-dot" style={{ background: log.color }}></div>
                            <div className="log-thread"></div>
                        </div>
                        <div className="log-body">
                            <div className="log-time"><b>{log.tag}</b> - {log.time}</div>
                            <div className="log-text"><b>{log.who}</b> {log.text}</div>
                        </div>
                    </div>
                )) : (
                    <div style={{ padding: "20px", textAlign: "center", color: "#888" }}>
                        Nenhuma movimentação encontrada.
                    </div>
                )}
            </div>

            {!isDesktop && (
                <Modal
                    open={searchOpen}
                    title="Pesquisar auditoria"
                    subtitle="Filtre por data e/ou por quem realizou a ação"
                    closeLabel="Cancelar"
                    onClose={() => setSearchOpen(false)}
                    actions={
                        <>
                            <div className="modal-btn primary" onClick={applyFilter}>Buscar</div>
                            <div className="modal-btn" onClick={clearFilter}>Limpar filtro</div>
                        </>
                    }
                >
                    {fields}
                </Modal>
            )}
        </>
    );
}
