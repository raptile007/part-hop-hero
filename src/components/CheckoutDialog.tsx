import { useState } from "react";
import { CheckCircle2, CreditCard, Loader2, Lock, Shield, Smartphone, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  total: number;
  onSuccess: () => void;
}

type PayMethod = "card" | "upi" | "cod";

export function CheckoutDialog({ open, onClose, total, onSuccess }: Props) {
  const [method, setMethod] = useState<PayMethod>("card");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [card, setCard] = useState("");
  const [exp, setExp] = useState("");
  const [cvv, setCvv] = useState("");
  const [upi, setUpi] = useState("");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  if (!open) return null;

  const validate = () => {
    if (!name.trim() || !email.trim() || !address.trim()) {
      toast.error("Please fill in your contact and address details.");
      return false;
    }
    if (method === "card") {
      const digits = card.replace(/\s/g, "");
      if (digits.length < 12) { toast.error("Enter a valid card number."); return false; }
      if (!/^\d{2}\/\d{2}$/.test(exp)) { toast.error("Expiry must be MM/YY."); return false; }
      if (cvv.length < 3) { toast.error("CVV must be 3 digits."); return false; }
    }
    if (method === "upi" && !/^[\w.\-]+@[\w]+$/.test(upi)) {
      toast.error("Enter a valid UPI ID, e.g. name@bank.");
      return false;
    }
    return true;
  };

  const handlePay = async () => {
    if (!validate()) return;
    setProcessing(true);
    // Simulate payment processing — wire to Stripe/Razorpay/Paddle later
    await new Promise((r) => setTimeout(r, 1400));
    setProcessing(false);
    setDone(true);
    toast.success("Payment successful — order confirmed.");
    setTimeout(() => {
      onSuccess();
      setDone(false);
      setName(""); setEmail(""); setAddress("");
      setCard(""); setExp(""); setCvv(""); setUpi("");
    }, 1500);
  };

  const formatCard = (v: string) =>
    v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const formatExp = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    if (d.length < 3) return d;
    return d.slice(0, 2) + "/" + d.slice(2);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-panel">
        {done ? (
          <div className="flex flex-col items-center justify-center gap-3 px-8 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground">Order placed!</h3>
            <p className="max-w-xs text-sm text-muted-foreground">
              Your parts are reserved. The shop will message you with pickup or delivery details.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                <div>
                  <div className="font-display text-base font-bold text-foreground">Checkout</div>
                  <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    Pay ₹{total.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>

            <div className="max-h-[70vh] space-y-5 overflow-y-auto px-5 py-5">
              {/* Contact */}
              <fieldset className="space-y-2">
                <legend className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Contact & Delivery
                </legend>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="w-full rounded-md border border-border bg-input/60 px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="Email"
                  className="w-full rounded-md border border-border bg-input/60 px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                />
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Delivery address"
                  rows={2}
                  className="w-full resize-none rounded-md border border-border bg-input/60 px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                />
              </fieldset>

              {/* Payment Method */}
              <fieldset>
                <legend className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Payment Method
                </legend>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { id: "card", label: "Card", Icon: CreditCard },
                    { id: "upi",  label: "UPI",  Icon: Smartphone },
                    { id: "cod",  label: "COD",  Icon: Wallet },
                  ] as const).map(({ id, label, Icon }) => (
                    <button
                      key={id}
                      onClick={() => setMethod(id)}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-md border px-2 py-3 text-xs transition-all",
                        method === id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-muted/30 text-muted-foreground hover:border-primary/50",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>

              {method === "card" && (
                <fieldset className="space-y-2">
                  <input
                    value={card}
                    onChange={(e) => setCard(formatCard(e.target.value))}
                    placeholder="Card number"
                    inputMode="numeric"
                    className="w-full rounded-md border border-border bg-input/60 px-3 py-2 text-sm font-display tracking-wider text-foreground outline-none focus:border-primary"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={exp}
                      onChange={(e) => setExp(formatExp(e.target.value))}
                      placeholder="MM/YY"
                      inputMode="numeric"
                      className="rounded-md border border-border bg-input/60 px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                    />
                    <input
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder="CVV"
                      inputMode="numeric"
                      type="password"
                      className="rounded-md border border-border bg-input/60 px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                    />
                  </div>
                </fieldset>
              )}

              {method === "upi" && (
                <input
                  value={upi}
                  onChange={(e) => setUpi(e.target.value)}
                  placeholder="UPI ID (e.g. you@okhdfc)"
                  className="w-full rounded-md border border-border bg-input/60 px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                />
              )}

              {method === "cod" && (
                <div className="rounded-md border border-warning/30 bg-warning/5 px-3 py-2 text-xs text-warning">
                  Cash on delivery available within 15 km. ₹50 handling fee applies at door.
                </div>
              )}

              <div className="flex items-center gap-2 rounded-md border border-secondary/30 bg-secondary/5 px-3 py-2 text-[11px] text-secondary">
                <Shield className="h-3.5 w-3.5" /> 256-bit encryption · This is a demo checkout — no real charge.
              </div>
            </div>

            <div className="border-t border-border/60 bg-background/40 px-5 py-4">
              <button
                onClick={handlePay}
                disabled={processing}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-gradient-primary px-4 py-3 font-display text-sm font-bold text-primary-foreground shadow-glow transition-transform hover:scale-[1.01] disabled:opacity-70"
              >
                {processing ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
                ) : (
                  <><Lock className="h-4 w-4" /> Pay ₹{total.toLocaleString("en-IN")}</>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
