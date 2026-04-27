import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import type { Part, User } from "../types";
import MechanicFinder from "../components/MechanicFinder";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [locations, setLocations] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [premiumMode, setPremiumMode] = useState(() => localStorage.getItem("premiumMode") !== "false");
  const [onlyInStock, setOnlyInStock] = useState(true);
  const [sortBy, setSortBy] = useState<"best-price" | "nearest" | "top-stock">("best-price");
  const [welcomeVisible, setWelcomeVisible] = useState(false);

  const loadSession = async () => {
    try {
      const data = await apiFetch<{ user: User | null }>("/api/auth/session");
      if (!data.user) {
        navigate("/");
        return;
      }
      setUser(data.user);
    } catch {
      navigate("/");
    }
  };

  const loadLocations = async () => {
    const data = await apiFetch<{ locations: string[] }>("/api/locations");
    setLocations(data.locations);
    if (data.locations.length > 0) {
      setSelectedLocation(data.locations[0]);
    }
  };

  const loadParts = async (location: string) => {
    setLoading(true);
    try {
      const query = location ? `?location=${encodeURIComponent(location)}` : "";
      const data = await apiFetch<{ parts: Part[] }>(`/api/parts${query}`);
      setParts(data.parts);
      setQuantities(data.parts.reduce((acc, part) => ({ ...acc, [part.id]: 1 }), {}));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await apiFetch("/api/auth/logout", { method: "POST" });
    navigate("/");
  };

  const handleOrder = async (partId: number) => {
    const quantity = quantities[partId] || 1;
    try {
      const result = await apiFetch<{ message: string; totalPrice: number }>("/api/orders", {
        method: "POST",
        body: JSON.stringify({ partId, quantity }),
      });
      setOrderMessage(`Order confirmed! Total ₹${result.totalPrice.toFixed(2)}.`);
      await loadParts(selectedLocation);
    } catch (error) {
      setOrderMessage((error as Error).message || "Unable to place the order.");
    }
  };

  useEffect(() => {
    loadSession();
    loadLocations();
  }, []);

  useEffect(() => {
    if (selectedLocation) loadParts(selectedLocation);
  }, [selectedLocation]);

  useEffect(() => {
    document.body.classList.toggle("premium", premiumMode);
    localStorage.setItem("premiumMode", premiumMode ? "true" : "false");
    return () => {
      document.body.classList.remove("premium");
    };
  }, [premiumMode]);

  useEffect(() => {
    if (user) {
      setWelcomeVisible(true);
      const timeout = window.setTimeout(() => setWelcomeVisible(false), 4200);
      return () => window.clearTimeout(timeout);
    }
  }, [user]);

  const activeLocationText = useMemo(() => selectedLocation || "All locations", [selectedLocation]);

  const filteredParts = useMemo(() => {
    const base = parts.filter((part) => (onlyInStock ? part.stock > 0 : true));

    if (sortBy === "nearest") {
      return [...base].sort((a, b) => {
        const aDistance = a.shop.location === selectedLocation ? 1 : 5;
        const bDistance = b.shop.location === selectedLocation ? 1 : 5;
        return aDistance - bDistance || a.price - b.price;
      });
    }

    if (sortBy === "top-stock") {
      return [...base].sort((a, b) => b.stock - a.stock || a.price - b.price);
    }

    return [...base].sort((a, b) => a.price - b.price);
  }, [parts, onlyInStock, sortBy, selectedLocation]);

  const bestPriceId = useMemo(() => {
    return filteredParts.reduce<number | null>((acc, part) => {
      if (acc === null || part.price < (filteredParts.find((item) => item.id === acc)?.price ?? Infinity)) {
        return part.id;
      }
      return acc;
    }, null);
  }, [filteredParts]);

  const nearestPartId = useMemo(() => {
    return filteredParts.find((part) => part.shop.location === selectedLocation)?.id ?? filteredParts[0]?.id ?? null;
  }, [filteredParts, selectedLocation]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8 lg:px-10 transition-colors duration-500">
      <div className="mx-auto max-w-[1440px] space-y-8">
        <header className="flex flex-col gap-4 rounded-3xl border border-slate-700 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20 sm:flex-row sm:items-center sm:justify-between premium-surface">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold">Bike Spare Parts Portal</h1>
              <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.26em] text-amber-200 shadow-glow">PRO</span>
            </div>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              View available spare parts filtered by location, place secure orders, and locate bike mechanics using GPS and Google Places API.
            </p>
            {welcomeVisible && user ? (
              <div className="mt-4 rounded-3xl border border-sky-500/20 bg-sky-500/10 px-4 py-3 text-sm text-sky-100 shadow-glow transition-opacity duration-500">
                Welcome back, <strong>{user.name}</strong> — premium dashboard mode is active.
              </div>
            ) : null}
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <span className="rounded-2xl bg-slate-800/90 px-4 py-2 text-sm text-slate-200 shadow-sm">{user ? `Logged in as ${user.name}` : "Loading user..."}</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPremiumMode((current) => !current)}
                className="rounded-2xl border border-slate-700 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-sky-400 hover:bg-sky-500/20"
              >
                {premiumMode ? "Premium Mode On" : "Premium Mode Off"}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-2xl bg-red-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-red-400"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[320px_1fr]">
          <div className="rounded-3xl border border-slate-700 bg-slate-900/85 p-6 shadow-lg shadow-slate-950/10">
            <h2 className="text-xl font-semibold text-white">Filter by location</h2>
            <p className="mt-2 text-sm text-slate-400">Select a zone to load available spare parts without refreshing the page.</p>

            <div className="mt-5 space-y-4">
              <label className="block text-sm text-slate-300">
                Choose location
                <select
                  value={selectedLocation}
                  onChange={(event) => setSelectedLocation(event.target.value)}
                  className="mt-3 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500"
                >
                  {locations.map((location) => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </label>

              <div className="grid gap-3 rounded-3xl border border-slate-700 bg-slate-950/60 p-4 text-sm text-slate-300">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-100">Advanced filters</span>
                  <span className="rounded-full bg-slate-800 px-2 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">PRO</span>
                </div>
                <label className="inline-flex items-center gap-3 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(event) => setOnlyInStock(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-950 text-sky-500 focus:ring-sky-500"
                  />
                  Only show in-stock inventory
                </label>
                <label className="block text-sm text-slate-300">
                  Sort by
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value as "best-price" | "nearest" | "top-stock")}
                    className="mt-3 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500"
                  >
                    <option value="best-price">Best price</option>
                    <option value="nearest">Nearest shop</option>
                    <option value="top-stock">Top stock</option>
                  </select>
                </label>
              </div>

              <div className="rounded-3xl border border-slate-700 bg-slate-950/60 p-4 text-sm text-slate-300">
                Active filter: <strong className="text-white">{activeLocationText}</strong>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-700 bg-slate-900/85 p-6 shadow-lg shadow-slate-950/10">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">Spare Parts Inventory</h2>
                  <p className="text-sm text-slate-400">Real-time inventory loaded through AJAX without page refresh.</p>
                </div>
                <div className="text-sm text-slate-400">{parts.length} parts available</div>
              </div>

              {orderMessage ? (
                <div className="mt-4 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200 shadow-glow">
                  {orderMessage}
                </div>
              ) : null}

              <div className="mt-6 overflow-x-auto premium-card">
                <table className="min-w-full text-left text-sm text-slate-100">
                  <thead className="border-b border-slate-700 text-slate-300">
                    <tr>
                      <th className="px-4 py-3">Part</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Shop</th>
                      <th className="px-4 py-3">Price (₹)</th>
                      <th className="px-4 py-3">Stock</th>
                      <th className="px-4 py-3">Quantity</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-slate-400">Loading parts...</td>
                      </tr>
                    ) : parts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-slate-400">No parts are currently available for this location.</td>
                      </tr>
                    ) : (
                      parts.map((part) => (
                        <tr key={part.id} className={`border-b border-slate-800 transition-all duration-300 ${part.id === nearestPartId ? "bg-slate-900/70" : "hover:bg-slate-900/70"}`}>
                          <td className="px-4 py-4 text-slate-100">{part.part_name}</td>
                          <td className="px-4 py-4 text-slate-400">{part.category}</td>
                          <td className="px-4 py-4 text-slate-300">
                            <div className="flex flex-wrap items-center gap-2">
                              <span>{part.shop.name}</span>
                              {part.id === nearestPartId ? (
                                <span className="premium-pill">Nearest</span>
                              ) : null}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-slate-100">
                            <div className="flex flex-wrap items-center gap-2">
                              <span>₹{part.price.toFixed(2)}</span>
                              {part.id === bestPriceId ? (
                                <span className="premium-pill premium-pill-accent">Best price</span>
                              ) : null}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-slate-100">{part.stock}</td>
                          <td className="px-4 py-4">
                            <input
                              type="number"
                              min={1}
                              max={part.stock}
                              value={quantities[part.id] ?? 1}
                              onChange={(event) => {
                                const newQuantity = Number(event.target.value);
                                setQuantities((current) => ({
                                  ...current,
                                  [part.id]: newQuantity,
                                }));
                              }}
                              className="w-20 rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <button
                              type="button"
                              onClick={() => handleOrder(part.id)}
                              disabled={part.stock === 0}
                              className="rounded-2xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-600"
                            >
                              {part.stock === 0 ? "Out of stock" : "Order"}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <MechanicFinder />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
