import { SearchIcon } from "../../components/ui/Icons";

interface CatalogToolbarProps {
    isDesktop: boolean
    onAdd: () => void
}

export default function CatalogToolbar({ isDesktop, onAdd }: CatalogToolbarProps) {
    return (
        <>
            <div className="catalog-toolbar">
                <div className="search-bar"><SearchIcon /><span>Procurar...</span></div>

                {isDesktop && (
                    <button type="button" className="header-btn" onClick={onAdd}>
                        + Novo item
                    </button>
                )}
            </div>

            {!isDesktop && <div className="section-label">Itens do catálogo</div>}
        </>
    );
}
