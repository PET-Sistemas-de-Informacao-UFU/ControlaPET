import type { Item } from "../interfaces/Item";

const STORAGE_KEY = "inpetario_items";

export const DEFAULT_ITEMS: Item[] = [
    { emoji: "📦", name: "Resma de papel", qty: "10 Un.", status: "Disponível — 10 unidades em estoque." },
    { emoji: "🔌", name: "Cabo HDMI", qty: "4 Un.", status: "3 disponíveis, 1 emprestado com Thiago." },
    { emoji: "⌨️", name: "Teclado", qty: "5 Un.", status: "5 disponíveis no armário PET." },
    { emoji: "🔋", name: "Extensão", qty: "7 Un.", status: "6 disponíveis, 1 em manutenção." },
    { emoji: "🖥️", name: "Monitor LG", qty: "2 Un.", status: "Emprestado com Thiago desde hoje, 10:00." },
    { emoji: "📽️", name: "Projetor Epson", qty: "1 Un.", status: "Disponível — reservar com antecedência." },
];

export function loadItems(): Item[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);

        if (raw) return JSON.parse(raw) as Item[];
    } catch (error) {
        console.warn("Não foi possível ler o localStorage, usando itens padrão.", error);
    }

    return DEFAULT_ITEMS.slice();
}

export function saveItems(items: Item[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}
