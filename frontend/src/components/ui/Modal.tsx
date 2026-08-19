import type { ReactNode } from "react";

interface ModalProps {
    open: boolean
    title: string
    subtitle?: string
    closeLabel: string
    onClose: () => void
    children?: ReactNode
    actions?: ReactNode
}

export default function Modal({ open, title, subtitle, closeLabel, onClose, children, actions }: ModalProps) {
    return (
        <div
            className={open ? "modal-overlay open" : "modal-overlay"}
            onClick={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div className="modal-sheet">
                <div className="modal-handle"></div>
                <div className="modal-title">{title}</div>
                {subtitle && <div className="modal-sub">{subtitle}</div>}

                {children}

                {actions && <div className="modal-actions">{actions}</div>}

                <div className="modal-close" onClick={onClose}>{closeLabel}</div>
            </div>
        </div>
    );
}
