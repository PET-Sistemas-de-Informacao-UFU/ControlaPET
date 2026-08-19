import { useCallback, useState, type ReactNode } from "react";
import { ItemsContext } from "./ItemsContext";
import type { Item } from "../interfaces/Item";
import { loadItems, saveItems } from "../service/itemStorage";

interface ItemsProviderProps {
    children: ReactNode;
}

export function ItemsProvider({ children }: ItemsProviderProps) {
    const [items, setItems] = useState<Item[]>(() => loadItems());

    const persist = useCallback((next: Item[]) => {
        setItems(next);
        saveItems(next);
    }, []);

    const addItem = useCallback((item: Item) => {
        persist([...items, item]);
    }, [items, persist]);

    const updateItem = useCallback((index: number, item: Item) => {
        persist(items.map((current, position) => (position === index ? item : current)));
    }, [items, persist]);

    const removeItem = useCallback((index: number) => {
        persist(items.filter((_, position) => position !== index));
    }, [items, persist]);

    return (
        <ItemsContext.Provider value={{ items, addItem, updateItem, removeItem }}>
            {children}
        </ItemsContext.Provider>
    );
}
