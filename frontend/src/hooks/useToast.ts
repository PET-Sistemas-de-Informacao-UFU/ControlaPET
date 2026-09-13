import { useCallback, useRef, useState } from "react";

export function useToast(duration = 2500) {
    const [message, setMessage] = useState<string | null>(null);
    const timeoutRef = useRef<number | null>(null);

    const showToast = useCallback((text: string) => {
        if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
        setMessage(text);
        timeoutRef.current = window.setTimeout(() => setMessage(null), duration);
    }, [duration]);

    return { message, showToast };
}
