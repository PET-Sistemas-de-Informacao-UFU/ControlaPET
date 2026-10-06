import { useEffect, useRef, useState } from "react";

interface FormSelectOption {
    value: string
    label: string
}

interface FormSelectProps {
    id: string
    value: string
    placeholder: string
    options: FormSelectOption[]
    onChange: (value: string) => void
}

export default function FormSelect({ id, value, placeholder, options, onChange }: FormSelectProps) {
    const [open, setOpen] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);
    const selectedOption = options.find((option) => option.value === value);

    useEffect(() => {
        function closeWhenClickingOutside(event: MouseEvent) {
            if (!selectRef.current?.contains(event.target as Node)) setOpen(false);
        }

        document.addEventListener("mousedown", closeWhenClickingOutside);
        return () => document.removeEventListener("mousedown", closeWhenClickingOutside);
    }, []);

    function chooseOption(optionValue: string) {
        onChange(optionValue);
        setOpen(false);
    }

    return (
        <div className="form-select" ref={selectRef}>
            <button
                id={id}
                type="button"
                className={open ? "form-select-trigger open" : "form-select-trigger"}
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() => setOpen((current) => !current)}
            >
                <span className={selectedOption ? "" : "form-select-placeholder"}>
                    {selectedOption?.label ?? placeholder}
                </span>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </button>

            {open && (
                <div className="form-select-options" role="listbox" aria-labelledby={id}>
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            role="option"
                            aria-selected={option.value === value}
                            className={option.value === value ? "selected" : ""}
                            onClick={() => chooseOption(option.value)}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
