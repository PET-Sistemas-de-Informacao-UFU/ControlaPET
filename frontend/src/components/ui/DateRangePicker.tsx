import { useEffect, useRef, useState } from "react";
import { CalendarIcon } from "./Icons";

interface DateRangePickerProps {
    id: string
    startDate: string
    endDate: string
    onChange: (startDate: string, endDate: string) => void
}

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function fromDateValue(value: string) {
    if (!value) return null;
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
}

function toDateValue(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDate(value: string) {
    const date = fromDateValue(value);
    return date ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(date) : "";
}

export default function DateRangePicker({ id, startDate, endDate, onChange }: DateRangePickerProps) {
    const selectedStart = fromDateValue(startDate);
    const [isOpen, setIsOpen] = useState(false);
    const [visibleMonth, setVisibleMonth] = useState(() => selectedStart ?? new Date());
    const containerRef = useRef<HTMLDivElement>(null);
    const todayValue = toDateValue(new Date());

    useEffect(() => {
        if (selectedStart) setVisibleMonth(selectedStart);
    }, [startDate]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
        }

        if (isOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const monthStart = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
    const days = Array.from({ length: monthStart.getDay() + daysInMonth }, (_, index) => index - monthStart.getDay() + 1);
    const monthLabel = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(visibleMonth);
    const label = startDate
        ? `${formatDate(startDate)}${endDate && endDate !== startDate ? ` — ${formatDate(endDate)}` : endDate ? "" : " · selecione o fim"}`
        : "Selecionar período";

    function selectDay(day: number) {
        const selectedValue = toDateValue(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day));

        if (!startDate || endDate) {
            onChange(selectedValue, "");
            return;
        }

        onChange(selectedValue < startDate ? selectedValue : startDate, selectedValue < startDate ? startDate : selectedValue);
        setIsOpen(false);
    }

    return (
        <div className="date-range-picker" ref={containerRef}>
            <button id={id} type="button" className={`date-range-trigger${startDate ? " has-value" : ""}`} aria-haspopup="dialog" aria-expanded={isOpen} onClick={() => setIsOpen((open) => !open)}>
                <CalendarIcon />
                <span>{label}</span>
            </button>

            {isOpen && (
                <div className="date-range-popover" role="dialog" aria-label="Selecionar período">
                    <div className="date-range-header">
                        <button type="button" aria-label="Mês anterior" onClick={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))}>‹</button>
                        <strong>{monthLabel}</strong>
                        <button type="button" aria-label="Próximo mês" onClick={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))}>›</button>
                    </div>
                    <div className="date-range-weekdays">{weekDays.map((day) => <span key={day}>{day}</span>)}</div>
                    <div className="date-range-days">
                        {days.map((day, index) => {
                            if (day < 1) return <span key={`empty-${index}`} />;

                            const value = toDateValue(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day));
                            const weekDay = (monthStart.getDay() + day - 1) % 7;
                            const isBetweenDates = Boolean(startDate && endDate && value > startDate && value < endDate);
                            const isRangeStart = Boolean(endDate && value === startDate && value !== endDate);
                            const isRangeEnd = Boolean(startDate && value === endDate && value !== startDate);
                            const className = [
                                "date-range-day",
                                value === startDate || value === endDate ? "selected" : "",
                                (value === startDate && (!endDate || value === endDate)) ? "single-date" : "",
                                isRangeStart ? "range-start" : "",
                                isRangeEnd ? "range-end" : "",
                                isBetweenDates ? "in-range" : "",
                                isBetweenDates && (weekDay === 0 || day === 1) ? "range-row-start" : "",
                                isBetweenDates && (weekDay === 6 || day === daysInMonth) ? "range-row-end" : "",
                                value === todayValue ? "today" : ""
                            ].filter(Boolean).join(" ");
                            return <button type="button" className={className} key={value} onClick={() => selectDay(day)}><span>{day}</span></button>;
                        })}
                    </div>
                    <div className="date-range-actions">
                        <button type="button" onClick={() => { onChange("", ""); setIsOpen(false); }}>Limpar</button>
                        <button type="button" onClick={() => { onChange(todayValue, todayValue); setIsOpen(false); }}>Hoje</button>
                    </div>
                </div>
            )}
        </div>
    );
}
