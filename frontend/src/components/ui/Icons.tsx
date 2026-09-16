const strokeProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
};

export function SearchIcon() {
    return (
        <svg {...strokeProps}>
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
        </svg>
    );
}

export function FilterIcon() {
    return (
        <svg {...strokeProps}>
            <path d="M4 5h16l-6 8v6l-4-2v-4L4 5Z" />
        </svg>
    );
}

export function CalendarIcon() {
    return (
        <svg {...strokeProps}>
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M16 3v4M8 3v4M3 10h18" />
        </svg>
    );
}

export function ChevronIcon() {
    return (
        <svg {...strokeProps}>
            <path d="m9 6 6 6-6 6" />
        </svg>
    );
}

export function EditIcon() {
    return (
        <svg {...strokeProps}>
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
    );
}

export function HomeIcon() {
    return (
        <svg {...strokeProps}>
            <path d="M3 9.5 12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V9.5Z" />
        </svg>
    );
}

export function CatalogIcon() {
    return (
        <svg {...strokeProps}>
            <rect x="3" y="4" width="18" height="4" rx="1" />
            <rect x="3" y="10" width="18" height="4" rx="1" />
            <rect x="3" y="16" width="18" height="4" rx="1" />
        </svg>
    );
}

export function AuditIcon() {
    return (
        <svg {...strokeProps}>
            <path d="M3 3v18h18" />
            <path d="M7 15v3M11 10v8M15 13v5M19 7v11" />
        </svg>
    );
}

export function LoanIcon() {
    return (
        <svg {...strokeProps}>
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M8 9h8M8 13h5" />
        </svg>
    );
}

export function UsersIcon() {
    return (
        <svg {...strokeProps}>
            <circle cx="9" cy="8" r="3" />
            <path d="M3.5 21v-1.5a5.5 5.5 0 0 1 11 0V21" />
            <path d="M16 5.5a3 3 0 0 1 0 5.8M20.5 21v-1.5a5.5 5.5 0 0 0-3.5-5.1" />
        </svg>
    );
}
