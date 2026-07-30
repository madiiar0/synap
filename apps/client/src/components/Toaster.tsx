import { useEffect, useState } from "react";
import { onToast } from "../lib/toast";

interface ToastItem {
  id: number;
  message: string;
}

/** Minimal error-toast stack (bottom-right, auto-dismiss). */
export default function Toaster(): JSX.Element {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(
    () =>
      onToast((message) => {
        const id = Date.now() + Math.random();
        setItems((list) => [...list.slice(-2), { id, message }]);
        setTimeout(() => setItems((list) => list.filter((item) => item.id !== id)), 4000);
      }),
    [],
  );

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex flex-col gap-2">
      {items.map((item) => (
        <div
          key={item.id}
          role="status"
          className="rounded-xl border border-red-200 bg-white px-4 py-3 text-sm text-red-600 shadow-lg"
        >
          {item.message}
        </div>
      ))}
    </div>
  );
}
