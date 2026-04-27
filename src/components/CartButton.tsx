import { ShoppingBag } from "lucide-react";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useCart } from "@/context/CartContext";

export function CartButton() {
  const { totalItems, setOpen } = useCart();
  const badgeRef = useRef<HTMLSpanElement>(null);
  const lastCount = useRef(totalItems);

  useEffect(() => {
    if (totalItems > lastCount.current && badgeRef.current) {
      gsap.fromTo(
        badgeRef.current,
        { scale: 0.4, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2.4)" },
      );
    }
    lastCount.current = totalItems;
  }, [totalItems]);

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="relative flex items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-2 text-sm text-foreground transition-all hover:border-primary/50 hover:shadow-glow"
      aria-label={`Open cart, ${totalItems} items`}
    >
      <ShoppingBag className="h-4 w-4 text-primary" />
      <span className="hidden sm:inline font-display text-xs uppercase tracking-widest text-muted-foreground">
        Cart
      </span>
      {totalItems > 0 && (
        <span
          ref={badgeRef}
          className="ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-primary px-1.5 font-display text-[10px] font-bold text-primary-foreground shadow-glow"
        >
          {totalItems}
        </span>
      )}
    </button>
  );
}
