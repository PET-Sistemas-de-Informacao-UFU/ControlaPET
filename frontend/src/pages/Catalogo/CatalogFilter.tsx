import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface CatalogFilterProps {
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
}

export default function CatalogFilter({ label, value, options, onChange }: CatalogFilterProps) {
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const selected = options.find((option) => option.value === value);

    useEffect(() => {
        if (!open) return;
        function closeOutside(event: PointerEvent) {
            const target = event.target as Node;
            if (!triggerRef.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false);
        }
        function closeOnScroll(event: Event) {
            if (menuRef.current?.contains(event.target as Node)) return;
            setOpen(false);
        }
        document.addEventListener("pointerdown", closeOutside);
        window.addEventListener("scroll", closeOnScroll, true);
        window.addEventListener("resize", closeOnScroll);
        const selectedButton = menuRef.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]');
        const menu = menuRef.current;
        const trigger = triggerRef.current;
        if (menu && trigger) {
            const menuRect = menu.getBoundingClientRect();
            const triggerRect = trigger.getBoundingClientRect();
            menu.style.left = `${Math.max(8, Math.min(triggerRect.left, window.innerWidth - menuRect.width - 8))}px`;
            if (menuRect.bottom > window.innerHeight - 8) {
                menu.style.top = `${Math.max(8, triggerRect.top - menuRect.height - 6)}px`;
            }
        }
        selectedButton?.focus();
        return () => {
            document.removeEventListener("pointerdown", closeOutside);
            window.removeEventListener("scroll", closeOnScroll, true);
            window.removeEventListener("resize", closeOnScroll);
        };
    }, [open]);

    function toggle() {
        if (!open && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setPosition({ top: rect.bottom + 6, left: Math.max(8, Math.min(rect.left, window.innerWidth - 148)), width: Math.max(rect.width, 140) });
        }
        setOpen(!open);
    }

    function onMenuKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
        if (event.key === "Escape") {
            setOpen(false);
            triggerRef.current?.focus();
        } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            const buttons = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('button') ?? []);
            const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
            buttons[(current + (event.key === "ArrowDown" ? 1 : -1) + buttons.length) % buttons.length]?.focus();
        }
    }

    return (
        <>
            <div className="catalog-filter-field">
                <div className="catalog-filter-measure" aria-hidden="true">
                    <span>{label}</span>
                    {options.filter((option) => option.value !== "").map((option) => <span key={option.value}>{option.label}</span>)}
                </div>
                <button ref={triggerRef} type="button" className={`catalog-filter-trigger${value ? " is-active" : ""}${open ? " is-open" : ""}`}
                    aria-label={`${label}: ${selected?.label ?? label}`} aria-haspopup="menu" aria-expanded={open} onClick={toggle}>
                    <span>{value ? selected?.label : label}</span>
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
                </button>
            </div>
            {open && createPortal(
                <div ref={menuRef} className="catalog-filter-menu" role="menu" aria-label={label} onKeyDown={onMenuKeyDown}
                    style={{ top: position.top, left: position.left, minWidth: position.width }}>
                    {options.map((option) => (
                        <button key={option.value} type="button" role="menuitemradio" aria-checked={option.value === value}
                            onClick={() => { onChange(option.value); setOpen(false); triggerRef.current?.focus(); }}>
                            <span>{option.label}</span>
                            {option.value === value && <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>}
                        </button>
                    ))}
                </div>, document.body
            )}
        </>
    );
}
