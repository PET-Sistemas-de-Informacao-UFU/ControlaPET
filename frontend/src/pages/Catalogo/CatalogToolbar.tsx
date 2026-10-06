import { SearchIcon } from "../../components/ui/Icons";

interface CatalogToolbarProps {
    isDesktop: boolean
    canManageItems: boolean
    search: string
    onAdd: () => void
    onSearchChange: (value: string) => void
}

export default function CatalogToolbar({ isDesktop, canManageItems, search, onAdd, onSearchChange }: CatalogToolbarProps) {
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

                {isDesktop && canManageItems && (
                    <button type="button" className="header-btn" onClick={onAdd}>
                        + Novo item
                    </button>
                )}

                {!isDesktop && canManageItems && (
                    <button type="button" className="catalog-add-btn" onClick={onAdd} aria-label="Adicionar item">
                        +
                    </button>
                )}
            </div>

            {!isDesktop && <div className="section-label">Itens do catálogo</div>}
        </>
    );
}
