import { SearchIcon } from "../../components/ui/Icons";
import type { ItemFilters } from "../../hooks/useItem";
import CatalogFilter from "./CatalogFilter";

interface CatalogToolbarProps {
    isDesktop: boolean
    canManageItems: boolean
    search: string
    onAdd: () => void
    onSearchChange: (value: string) => void
    type: ItemFilters["type"]
    condition: ItemFilters["condition"]
    available: ItemFilters["available"]
    onTypeChange: (value: ItemFilters["type"]) => void
    onConditionChange: (value: ItemFilters["condition"]) => void
    onAvailableChange: (value: ItemFilters["available"]) => void
}

export default function CatalogToolbar({ isDesktop, canManageItems, search, onAdd, onSearchChange, type, condition, available, onTypeChange, onConditionChange, onAvailableChange }: CatalogToolbarProps) {
    return (
        <>
            <div className="catalog-toolbar">
                <label className="search-bar">
                    <SearchIcon />
                    <input
                        type="search"
                        value={search}
                        onChange={(event) => onSearchChange(event.target.value)}
                        placeholder="Procurar..."
                        aria-label="Procurar item no catálogo"
                    />
                </label>

                <div className="catalog-filters" aria-label="Filtros do catálogo">
                    <CatalogFilter label="Tipo" value={type} onChange={(value) => onTypeChange(value as ItemFilters["type"])} options={[
                        { value: "", label: "Todos os tipos" }, { value: "BORROWABLE", label: "Empréstimo" },
                        { value: "CONSUMABLE", label: "Consumo" }, { value: "PERMANENT", label: "Permanente" },
                    ]} />
                    <CatalogFilter label="Disponibilidade" value={available} onChange={(value) => onAvailableChange(value as ItemFilters["available"])} options={[
                        { value: "", label: "Todos os itens" }, { value: "true", label: "Em estoque" }, { value: "false", label: "Sem estoque" },
                    ]} />
                    <CatalogFilter label="Condição" value={condition} onChange={(value) => onConditionChange(value as ItemFilters["condition"])} options={[
                        { value: "", label: "Todas as condições" }, { value: "NEW", label: "Novo" },
                        { value: "GOOD", label: "Bom" }, { value: "DAMAGED", label: "Danificado" },
                    ]} />
                </div>

                {isDesktop && canManageItems && (
                    <button type="button" className="header-btn catalog-create-btn" onClick={onAdd}>
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
                        Novo item
                    </button>
                )}

                {!isDesktop && canManageItems && (
                    <button type="button" className="catalog-add-btn" onClick={onAdd} aria-label="Adicionar item">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
                    </button>
                )}
            </div>

            {!isDesktop && <div className="section-label">Itens do catálogo</div>}
        </>
    );
}
