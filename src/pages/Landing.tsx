import { useEffect, useMemo, useState } from "react";
import "../../bike-parts-ui.css";

type VehicleType = "Bike" | "Car" | "Scooter";

type PartItem = {
  id: number;
  title: string;
  brand: string;
  category: string;
  price: number;
  stock: "In stock" | "Low" | "Out";
  distance: number;
  shop: string;
  city: string;
  vehicle: VehicleType;
  image: string;
};

const brands = [
  {
    name: "KTM",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/KTM-Logo.svg/200px-KTM-Logo.svg.png",
    tagline: "Off-road performance",
    features: ["Brake kits", "Clutch parts", "Oil filters"],
    color: "#ff6900"
  },
  {
    name: "Honda",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Honda_Logo.svg/200px-Honda_Logo.svg.png",
    tagline: "Everyday reliability",
    features: ["Spark plugs", "Air filters", "Chains"],
    color: "#46b8ff"
  },
  {
    name: "BMW",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/200px-BMW.svg.png",
    tagline: "Premium touring parts",
    features: ["Suspension", "Brake calipers", "Battery systems"],
    color: "#90b3ff"
  },
  {
    name: "Pulsar",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Bajaj_Auto_logo.svg/200px-Bajaj_Auto_logo.svg.png",
    tagline: "High-value upgrades",
    features: ["Tyres", "Seat covers", "Lighting"],
    color: "#ffd55a"
  },
];

const categories = [
  { icon: "🛠", title: "Brakes", desc: "Pads, discs, calipers" },
  { icon: "⚙️", title: "Engine", desc: "Oil, filters, spark plugs" },
  { icon: "⛓️", title: "Chain & Sprocket", desc: "Drive components" },
  { icon: "🪜", title: "Suspension", desc: "Shocks, forks, springs" },
  { icon: "🛞", title: "Tyres", desc: "Tubes, rims, wheels" },
  { icon: "🎒", title: "Accessories", desc: "Lights, seats, covers" },
];

const parts: PartItem[] = [
  {
    id: 1,
    title: "KTM Ceramic Brake Pads",
    brand: "KTM",
    category: "Brakes",
    price: 850,
    stock: "In stock",
    distance: 2.2,
    shop: "Velocity Moto",
    city: "Mumbai",
    vehicle: "Bike",
    image: "https://images.unsplash.com/photo-1613214149922-f1809c99c0b1?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 2,
    title: "Honda Iridium Spark Plug",
    brand: "Honda",
    category: "Engine",
    price: 320,
    stock: "Low",
    distance: 1.8,
    shop: "Urban Garage",
    city: "Pune",
    vehicle: "Bike",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 3,
    title: "BMW Performance Suspension Kit",
    brand: "BMW",
    category: "Suspension",
    price: 4500,
    stock: "In stock",
    distance: 3.6,
    shop: "Wheel Works",
    city: "Mumbai",
    vehicle: "Bike",
    image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 4,
    title: "Pulsar LED Headlight Kit",
    brand: "Pulsar",
    category: "Accessories",
    price: 2750,
    stock: "Out",
    distance: 4.1,
    shop: "Spark Tech",
    city: "Delhi",
    vehicle: "Bike",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 5,
    title: "KTM Chain & Sprocket Kit",
    brand: "KTM",
    category: "Chain & Sprocket",
    price: 540,
    stock: "In stock",
    distance: 2.9,
    shop: "Rider Hub",
    city: "Bengaluru",
    vehicle: "Bike",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 6,
    title: "Honda High-Performance Tyre",
    brand: "Honda",
    category: "Tyres",
    price: 1120,
    stock: "Low",
    distance: 4.5,
    shop: "BeamWorks",
    city: "Mumbai",
    vehicle: "Bike",
    image: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 7,
    title: "BMW Brake Caliper Set",
    brand: "BMW",
    category: "Brakes",
    price: 3200,
    stock: "In stock",
    distance: 5.2,
    shop: "Premium Moto",
    city: "Delhi",
    vehicle: "Bike",
    image: "https://images.unsplash.com/photo-1613214149922-f1809c99c0b1?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 8,
    title: "Pulsar Performance Battery",
    brand: "Pulsar",
    category: "Engine",
    price: 1850,
    stock: "In stock",
    distance: 3.1,
    shop: "ElectroRide",
    city: "Pune",
    vehicle: "Bike",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80"
  }
];

const locations = ["Mumbai", "Pune", "Delhi", "Bengaluru"];

const Landing = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [vehicle, setVehicle] = useState<VehicleType>("Bike");
  const [location, setLocation] = useState(locations[0]);
  const [stock, setStock] = useState("all");
  const [sort, setSort] = useState("price-asc");
  const [query, setQuery] = useState("");
  const [selectedPart, setSelectedPart] = useState<PartItem | null>(null);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      observerOptions
    );

    // Observe all fade-in elements
    document.querySelectorAll<HTMLElement>(".fade-in").forEach((element) => {
      observer.observe(element);
    });

    // Cursor glow effect
    const cursorGlow = document.querySelector<HTMLElement>('.cursor-glow');
    if (cursorGlow) {
      let mouseX = 0;
      let mouseY = 0;
      let glowX = 0;
      let glowY = 0;

      const updateGlow = () => {
        glowX += (mouseX - glowX) * 0.1;
        glowY += (mouseY - glowY) * 0.1;
        cursorGlow.style.transform = `translate(${glowX - 240}px, ${glowY - 240}px)`;
        requestAnimationFrame(updateGlow);
      };

      document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      });

      updateGlow();
    }

    // Magnetic button effect
    const magneticButtons = document.querySelectorAll<HTMLElement>('.btn-magnetic');
    magneticButtons.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px) scale(1.05)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0px, 0px) scale(1)';
      });
    });

    return () => observer.disconnect();
  }, []);

  const filteredParts = useMemo(() => {
    return [...parts]
      .filter((part) => {
        if (selectedCategory && part.category !== selectedCategory) return false;
        if (selectedBrand && part.brand !== selectedBrand) return false;
        if (vehicle && part.vehicle !== vehicle) return false;
        if (location && part.city !== location) return false;
        if (stock !== "all" && part.stock.toLowerCase().replace(" ", "-") !== stock) return false;
        if (query && !`${part.title} ${part.brand} ${part.shop}`.toLowerCase().includes(query.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => {
        if (sort === "price-asc") return a.price - b.price;
        if (sort === "price-desc") return b.price - a.price;
        if (sort === "distance-asc") return a.distance - b.distance;
        return 0;
      });
  }, [selectedCategory, selectedBrand, vehicle, location, stock, query, sort]);

  const stockBadgeClass = (stockValue: string) => {
    if (stockValue === "In stock") return "stock-in";
    if (stockValue === "Low") return "stock-low";
    return "stock-out";
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const closeModal = () => {
    setSelectedPart(null);
  };

  return (
    <div className="app-shell">
      <main className="page-frame">
        <section className="hero-block fade-in">
          {/* Cinematic Background Video */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="hero-video"
            poster="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1920&q=80"
          >
            <source src="https://player.vimeo.com/external/370206427.sd.mp4?s=e90dcaba73c19e0e36f03406b47bbd6d4c9b63a7&profile_id=165" type="video/mp4" />
            {/* Fallback: Use a static image if video fails */}
          </video>

          {/* Gradient Overlay for Text Readability */}
          <div className="hero-overlay"></div>

          <div className="hero-content">
            <div className="hero-copy">
              <span className="eyebrow">🏍️ Premium Bike Parts Platform</span>
              <h1>Find the Perfect Parts for Your Ride</h1>
              <p>Discover high-quality motorcycle parts from trusted brands. Location-based search, real-time inventory, and expert recommendations for every rider.</p>
              <div className="hero-actions">
                <button className="btn btn-primary" type="button" onClick={() => scrollTo("partsSection")}>Explore Parts</button>
                <button className="btn btn-outline" type="button" onClick={() => scrollTo("categoriesSection")}>Browse Categories</button>
              </div>
              <div className="hero-stats">
                <div>
                  <strong>120+</strong>
                  <span>Verified Shops</span>
                </div>
                <div>
                  <strong>3400+</strong>
                  <span>Parts listed</span>
                </div>
                <div>
                  <strong>98%</strong>
                  <span>Stock accuracy</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="brands-block fade-in" id="brandsSection">
          <div className="section-header">
            <div>
              <p className="section-label">Trusted Brands</p>
              <h2>Top brands powering your ride.</h2>
            </div>
          </div>
          <div className="brand-carousel">
            {brands.map((brand) => (
              <article
                key={brand.name}
                className={`brand-card ${selectedBrand === brand.name ? "active" : ""}`}
                onClick={() => setSelectedBrand((current) => (current === brand.name ? null : brand.name))}
                style={{ borderColor: `${brand.color}33`, background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01))" }}
              >
                <div className="brand-top">
                  <div className="brand-logo" style={{ color: brand.color, borderColor: `${brand.color}22` }}>
                    {brand.name[0]}
                  </div>
                  <div className="brand-pill">{brand.name}</div>
                </div>
                <div className="brand-content">
                  <h3>{brand.name}</h3>
                  <p>{brand.tagline}</p>
                </div>
                <div className="brand-footer">
                  {brand.features.map((feature) => (
                    <span key={feature}>{feature}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="categories-block fade-in" id="categoriesSection">
          <div className="section-header">
            <div>
              <p className="section-label">🛠️ Motorcycle Categories</p>
              <h2>Complete Bike Maintenance Solutions</h2>
              <p>From routine maintenance to performance upgrades, find everything you need for your motorcycle.</p>
            </div>
          </div>
          <div className="category-grid">
            {categories.map((categoryItem) => (
              <article
                key={categoryItem.title}
                className={`category-card ${selectedCategory === categoryItem.title ? "active" : ""}`}
                onClick={() => setSelectedCategory((current) => (current === categoryItem.title ? null : categoryItem.title))}
              >
                <div className="category-icon">{categoryItem.icon}</div>
                <div>
                  <h3>{categoryItem.title}</h3>
                  <p>Premium {categoryItem.title.toLowerCase()} parts</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="parts-block fade-in" id="partsSection">
          <div className="section-header section-header-between">
            <div>
              <p className="section-label">Featured Inventory</p>
              <h2>Premium parts curated for your vehicle.</h2>
            </div>
            <div className="parts-controls">
              <input
                type="search"
                id="searchInput"
                placeholder="Search parts, brands, or shops"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              {(selectedCategory || selectedBrand || query) && (
                <button
                  className="clear-filters-btn"
                  onClick={() => {
                    setSelectedCategory(null);
                    setSelectedBrand(null);
                    setQuery("");
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
          <div className="parts-grid">
            {filteredParts.map((part) => (
              <article key={part.id} className="part-card" onClick={() => setSelectedPart(part)}>
                <div className="part-overlay">
                  <span className="distance">{part.distance.toFixed(1)} km away</span>
                  <span className="price">Best: ₹{part.price}</span>
                </div>
                <div className="part-image" style={{ backgroundImage: `url('${part.image}')` }} />
                <div className="part-meta">
                  <div className="part-tag">{part.brand}</div>
                  <h3>{part.title}</h3>
                  <p>{part.category} · {part.vehicle}</p>
                  <div className="part-footer">
                    <span className="part-price">₹{part.price}</span>
                    <span className={`stock-badge ${stockBadgeClass(part.stock)}`}>{part.stock}</span>
                  </div>
                  <div className="part-actions">
                    <button className="btn btn-outline btn-sm" type="button" onClick={(e) => { e.stopPropagation(); setSelectedPart(part); }}>View Details</button>
                    <button className="btn btn-primary btn-sm" type="button" onClick={(e) => { e.stopPropagation(); scrollTo("inventorySection"); }}>Check Availability</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="inventory-block fade-in" id="inventorySection">
          <div className="inventory-panel">
            <div className="inventory-aside">
              <div style={{ position: 'relative' }}>
                <span className="ai-hint">✨ Best prices near you</span>
                <p className="section-label">Inventory Finder</p>
                <h2>Search availability by location and vehicle.</h2>
              </div>
              <div className="toggle-group" role="group">
                {(["Bike", "Car", "Scooter"] as VehicleType[]).map((option) => (
                  <button
                    key={option}
                    className={`toggle-btn ${vehicle === option ? "active" : ""}`}
                    type="button"
                    data-vehicle={option}
                    onClick={() => setVehicle(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <div className="filter-row">
                <div className="filter-card">
                  <label>City</label>
                  <select value={location} onChange={(event) => setLocation(event.target.value)}>
                    {locations.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                <div className="filter-card">
                  <label>Stock</label>
                  <select value={stock} onChange={(event) => setStock(event.target.value)}>
                    <option value="all">All</option>
                    <option value="in-stock">In stock</option>
                    <option value="low">Low stock</option>
                    <option value="out">Out</option>
                  </select>
                </div>
                <div className="filter-card">
                  <label>Sort</label>
                  <select value={sort} onChange={(event) => setSort(event.target.value)}>
                    <option value="price-asc">Price low → high</option>
                    <option value="price-desc">Price high → low</option>
                    <option value="distance-asc">Nearest</option>
                  </select>
                </div>
              </div>
              <button className="btn btn-primary btn-wide" type="button" onClick={() => scrollTo("inventorySection")}>Find Parts</button>
            </div>
            <div className="inventory-result">
              <div className="inventory-result-header">
                <p>Inventory results</p>
                <span>{filteredParts.length} results</span>
              </div>
              <div className="inventory-cards">
                {filteredParts.map((part) => (
                  <article key={part.id} className="inventory-card">
                    <div>
                      <h3>{part.title}</h3>
                      <p>{part.shop} · {part.city}</p>
                    </div>
                    <div className="meta-row">
                      <div><span>Distance</span><strong>{part.distance.toFixed(1)} km</strong></div>
                      <div><span>Stock</span><strong className={`stock-badge ${stockBadgeClass(part.stock)}`}>{part.stock}</strong></div>
                      <div><span>Price</span><strong>₹{part.price}</strong></div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="map-block fade-in" id="mapSection">
          <div className="section-header">
            <div>
              <p className="section-label">📍 Location-Based Search</p>
              <h2>Find Parts at Nearby Motorcycle Shops</h2>
              <p>Real-time shop locations with inventory availability and contact details.</p>
            </div>
          </div>
          <div className="map-display">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.5!2d77.5946!3d12.9716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0x73c2c4b6b5b4c4b4!2sBangalore%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1703123456789!5m2!1sen!2sin"
              className="map-frame"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Nearby Motorcycle Shops"
            ></iframe>
            <div className="map-info-card">
              <div className="live-badge">🔴 Live</div>
              <p>Featured shop</p>
              <h3>Velocity Moto Garage</h3>
              <div className="map-info-grid">
                <div><span>Stock Accuracy</span><strong>97%</strong></div>
                <div><span>Estimated Time</span><strong>5 min</strong></div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Product Detail Modal */}
      {selectedPart && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal} type="button">×</button>

            <div className="modal-image">
              <img src={selectedPart.image} alt={selectedPart.title} />
            </div>

            <div className="modal-details">
              <div className="modal-header">
                <span className="modal-brand">{selectedPart.brand}</span>
                <h2 className="modal-title">{selectedPart.title}</h2>
              </div>

              <div className="modal-meta">
                <div className="modal-price">₹{selectedPart.price}</div>
                <div className={`modal-stock ${stockBadgeClass(selectedPart.stock)}`}>{selectedPart.stock}</div>
              </div>

              <div className="modal-info">
                <div className="info-item">
                  <span>Category</span>
                  <strong>{selectedPart.category}</strong>
                </div>
                <div className="info-item">
                  <span>Vehicle</span>
                  <strong>{selectedPart.vehicle}</strong>
                </div>
                <div className="info-item">
                  <span>Available at</span>
                  <strong>{selectedPart.shop}</strong>
                </div>
                <div className="info-item">
                  <span>Distance</span>
                  <strong>{selectedPart.distance.toFixed(1)} km</strong>
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn btn-outline" type="button" onClick={() => scrollTo("inventorySection")}>Check Nearby Shops</button>
                <button className="btn btn-primary" type="button" onClick={() => scrollTo("inventorySection")}>Find Best Price</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;
