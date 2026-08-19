import { createContext } from "react";
import type { Item } from "../interfaces/Item";

export interface ItemsContextData {
    items: Item[]
    addItem: (item: Item) => void
    updateItem: (index: number, item: Item) => void
    removeItem: (index: number) => void
}

export const ItemsContext = createContext<ItemsContextData>({} as ItemsContextData);
