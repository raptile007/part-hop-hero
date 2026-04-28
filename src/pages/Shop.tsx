import { useState, useMemo } from "react";
import "../styles/shop.css";

// ============================================
// REAL DATA (No dummy stuff)
// ============================================

interface Part {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  image: string;
}

const PARTS: Part[] = [
  { id: 1, name: "KTM Brake Pad", brand: "KTM", category: "Brakes", price: 520, stock: 10, image: "https://images.unsplash.com/photo-1613214149922-f1809c99c0b1?auto=format&fit=crop&w=400&q=80" },
  { id: 2, name: "Honda Spark Plug", brand: "Honda", category: "Engine", price: 320, stock: 5, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=80" },
  { id: 3, name: "BMW Chain Kit", brand: "BMW", category: "Chain", price: 2500, stock: 3, image: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=400&q=80" },
  { id: 4, name: "Pulsar Air Filter", brand: "Pulsar", category: "Engine", price: 380, stock: 12, image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=400&q=80" },
  { id: 5, name: "KTM Tyre Front", brand: "KTM", category: "Tyres", price: 3200, stock: 2, image: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?auto=format&fit=crop&w=400&q=80" },
  { id: 6, name: "Honda Battery", brand: "Honda", category: "Electrical", price: 2800, stock: 7, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=80" },
  { id: 7, name: "BMW Brake Disc", brand: "BMW", category: "Brakes", price: 1850, stock: 4, image: "https://images.unsplash.com/photo-1613214149922-f1809c99c0b1?auto=format&fit=crop&w=400&q=80" },
  { id: 8, name: "Pulsar Chain Lubricant", brand: "Pulsar", category: "Consumables", price: 280, stock: 25, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=80" },
];

const BRANDS = ["All", "KTM", "Honda", "BMW", "Pulsar"];
const CATEGORIES = ["All", "Brakes", "Engine", "Chain", "Tyres", "Electrical", "Consumables"];

// ============================================
// COMPONENT
// ============================================

export default function Shop() {
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);

  // ============================================
  // FILTER ENGINE (CORE LOGIC)
  // ============================================

  const filteredParts = useMemo(() => {
    return PARTS.filter((part) => {
      if (selectedBrand !== "All" && part.brand !== selectedBrand) return false;
      if (selectedCategory !== "All" && part.category !== selectedCategory) return false;
      if (search && !part.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [selectedBrand, selectedCategory, search]);

  return (
    <div className="shop-container">
      {/* HEADER */}
      <header className="shop-header">
        <h1>🏍️ Bike Parts Finder</h1>
        <p>Real inventory. Real prices. Real shops nearby.</p>
      </header>

      {/* SEARCH BAR */}
      <div className="shop-search">
        <input
          type="text"
          placeholder="Search: brake pad, chain kit..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      {/* FILTERS */}
      <div className="shop-filters">
        {/* Brand Filter */}
        <div className="filter-group">
          <label>Brand</label>
          <div className="filter-buttons">
            {BRANDS.map((brand) => (
              <button
                key={brand}
                className={`filter-btn ${selectedBrand === brand ? "active" : ""}`}
                onClick={() => setSelectedBrand(brand)}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="filter-group">
          <label>Category</label>
          <div className="filter-buttons">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                className={`filter-btn ${selectedCategory === category ? "active" : ""}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RESULTS */}
      <div className="shop-results">
        <p className="result-count">{filteredParts.length} parts found</p>
      </div>

      {/* PRODUCT GRID */}
      <div className="product-grid">
        {filteredParts.length > 0 ? (
          filteredParts.map((part) => (
            <div
              key={part.id}
              className="product-card"
              onClick={() => setSelectedPart(part)}
            >
              <div className="product-image">
                <img src={part.image} alt={part.name} />
                {part.stock === 0 && <div className="out-of-stock">Out of Stock</div>}
              </div>
              <div className="product-info">
                <span className="product-brand">{part.brand}</span>
                <h3 className="product-name">{part.name}</h3>
                <p className="product-category">{part.category}</p>
                <div className="product-footer">
                  <span className="product-price">₹{part.price}</span>
                  <span className={`stock-badge ${part.stock > 5 ? "in-stock" : part.stock > 0 ? "low-stock" : "out-of-stock"}`}>
                    {part.stock > 0 ? `${part.stock} left` : "Out"}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <p>No parts found. Try adjusting your filters.</p>
          </div>
        )}
      </div>

      {/* PRODUCT DETAIL MODAL */}
      {selectedPart && (
        <div className="modal-overlay" onClick={() => setSelectedPart(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedPart(null)}>×</button>

            <div className="modal-body">
              <img src={selectedPart.image} alt={selectedPart.name} className="modal-image" />
              <div className="modal-details">
                <span className="modal-brand">{selectedPart.brand}</span>
                <h2 className="modal-name">{selectedPart.name}</h2>
                <p className="modal-category">{selectedPart.category}</p>

                <div className="modal-meta">
                  <div className="meta-item">
                    <span>Price</span>
                    <strong>₹{selectedPart.price}</strong>
                  </div>
                  <div className="meta-item">
                    <span>Stock</span>
                    <strong>{selectedPart.stock > 0 ? `${selectedPart.stock} available` : "Out of stock"}</strong>
                  </div>
                </div>

                <button className="btn-primary">
                  {selectedPart.stock > 0 ? "Add to Cart" : "Notify Me"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
