import { Minus, Plus, ShoppingBag, Trash2, X, Lock } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { CheckoutDialog } from "@/components/CheckoutDialog";
import { cn } from "@/lib/utils";

export function CartDrawer() {
  const { lines, isOpen, setOpen, setQty, remove, subtotal, totalItems, clear } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const shipping = subtotal > 0 ? (subtotal > 5000 ? 0 : 99) : 0;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-background/70 backdrop-blur-sm transition-opacity",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setOpen(false)}
      />
      {/* Panel */}
      <aside
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-panel transition-transform duration-500 ease-power3",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-primary" />
            <div>
              <div className="font-display text-base font-bold text-foreground">Your Cart</div>
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                {totalItems} item{totalItems === 1 ? "" : "s"}
              </div>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close cart"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground/40" />
              <div className="text-sm font-medium text-muted-foreground">Cart is empty</div>
              <div className="text-xs text-muted-foreground/70">
                Pick a shop, add a part — it'll show up here.
              </div>
            </div>
          ) : (
            <ul className="space-y-3">
              {lines.map((l) => (
                <li
                  key={l.id}
                  className="rounded-lg border border-border bg-background/40 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-foreground">
                        {l.partName}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {l.brand} · from <span className="text-secondary">{l.shopName}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => remove(l.id)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Remove from cart"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1 rounded-md border border-border bg-muted/40">
                      <button
                        onClick={() => setQty(l.id, l.qty - 1)}
                        className="p-1.5 text-muted-foreground hover:text-foreground"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center font-display text-sm font-semibold text-foreground">
                        {l.qty}
                      </span>
                      <button
                        onClick={() => setQty(l.id, l.qty + 1)}
                        disabled={l.qty >= l.maxStock}
                        className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-40"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-sm font-bold text-foreground">
                        ₹{(l.qty * l.unitPrice).toLocaleString("en-IN")}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        ₹{l.unitPrice.toLocaleString("en-IN")} each · max {l.maxStock}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 && (
          <div className="border-t border-border/60 bg-background/40 p-5">
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <dt>Subtotal</dt>
                <dd className="font-display text-foreground">₹{subtotal.toLocaleString("en-IN")}</dd>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <dt>Shipping {subtotal > 5000 && <span className="text-success">(free)</span>}</dt>
                <dd className="font-display text-foreground">
                  {shipping === 0 ? "Free" : `₹${shipping}`}
                </dd>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <dt>GST (18%)</dt>
                <dd className="font-display text-foreground">₹{tax.toLocaleString("en-IN")}</dd>
              </div>
              <div className="mt-2 flex justify-between border-t border-border/60 pt-2 text-base">
                <dt className="font-semibold text-foreground">Total</dt>
                <dd className="font-display text-lg font-bold text-primary">
                  ₹{total.toLocaleString("en-IN")}
                </dd>
              </div>
            </dl>
            <button
              onClick={() => setCheckoutOpen(true)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-gradient-primary px-4 py-3 font-display text-sm font-bold text-primary-foreground shadow-glow transition-transform hover:scale-[1.01]"
            >
              <Lock className="h-4 w-4" />
              Secure Checkout
            </button>
            <button
              onClick={clear}
              className="mt-2 w-full text-center text-[11px] uppercase tracking-widest text-muted-foreground hover:text-destructive"
            >
              Clear cart
            </button>
          </div>
        )}
      </aside>

      <CheckoutDialog
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        total={total}
        onSuccess={() => {
          clear();
          setCheckoutOpen(false);
          setOpen(false);
        }}
      />
    </>
  );
}
