const brands = [
  { name: "KTM", color: "#ff6900", tagline: "Off-road performance", features: ["Brake kits", "Clutch parts", "Oil filters"] },
  { name: "Honda", color: "#46b8ff", tagline: "Everyday reliability", features: ["Spark plugs", "Air filters", "Chains"] },
  { name: "BMW", color: "#90b3ff", tagline: "Premium touring parts", features: ["Suspension", "Brake calipers", "Battery systems"] },
  { name: "Pulsar", color: "#ffd55a", tagline: "High-value upgrades", features: ["Tyres", "Seat covers", "Lighting"] },
];

const categories = [
  { icon: "🛠", title: "Brakes" },
  { icon: "⚙️", title: "Engine" },
  { icon: "⚡", title: "Electrical" },
  { icon: "🛞", title: "Tyres" },
  { icon: "🎒", title: "Accessories" },
];

const parts = [
  { id: 1, title: "Ceramic Brake Pads", brand: "KTM", category: "Brakes", price: 850, stock: "In stock", distance: 2.2, shop: "Velocity Moto", city: "Mumbai", vehicle: "Bike", image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80" },
  { id: 2, title: "Premium Spark Plug", brand: "Honda", category: "Engine", price: 320, stock: "Low", distance: 1.8, shop: "Urban Garage", city: "Pune", vehicle: "Bike", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80" },
  { id: 3, title: "Alloy Wheel Tyre", brand: "BMW", category: "Tyres", price: 4500, stock: "In stock", distance: 3.6, shop: "Wheel Works", city: "Mumbai", vehicle: "Car", image: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80" },
  { id: 4, title: "Performance Battery", brand: "Pulsar", category: "Electrical", price: 2750, stock: "Out", distance: 4.1, shop: "Spark Tech", city: "Delhi", vehicle: "Scooter", image: "https://images.unsplash.com/photo-1515222589063-266cece0fbb5?auto=format&fit=crop&w=800&q=80" },
  { id: 5, title: "Precision Oil Filter", brand: "KTM", category: "Engine", price: 540, stock: "In stock", distance: 2.9, shop: "Rider Hub", city: "Bengaluru", vehicle: "Scooter", image: "https://images.unsplash.com/photo-1512314889357-e157c22f938d?auto=format&fit=crop&w=800&q=80" },
  { id: 6, title: "LED Headlight Kit", brand: "Honda", category: "Electrical", price: 1120, stock: "Low", distance: 4.5, shop: "BeamWorks", city: "Mumbai", vehicle: "Car", image: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=800&q=80" },
];

const locations = ["Mumbai", "Pune", "Delhi", "Bengaluru"];
const state = {
  category: null,
  vehicle: "Bike",
  location: locations[0],
  stock: "all",
  sort: "price-asc",
  query: "",
};

const brandGrid = document.getElementById("brandGrid");
const categoryGrid = document.getElementById("categoryGrid");
const partsGrid = document.getElementById("partsGrid");
const inventoryCards = document.getElementById("inventoryCards");
const locationSelect = document.getElementById("locationSelect");
const stockSelect = document.getElementById("stockSelect");
const sortSelect = document.getElementById("sortSelect");
const searchInput = document.getElementById("searchInput");
const findPartsBtn = document.getElementById("findPartsBtn");
const exploreBtn = document.getElementById("exploreBtn");
const browseBtn = document.getElementById("browseBtn");
const resultCount = document.getElementById("resultCount");

function createBrandCards() {
  brandGrid.innerHTML = brands
    .map(brand => `
      <article class="brand-card" style="border-color: ${brand.color}33; background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01));">
        <div class="brand-top">
          <div class="brand-logo" style="color:${brand.color}; border-color:${brand.color}22;">${brand.name[0]}</div>
          <div class="brand-pill">${brand.name}</div>
        </div>
        <div class="brand-content">
          <h3>${brand.name}</h3>
          <p>${brand.tagline}</p>
        </div>
        <div class="brand-footer">
          ${brand.features.map(item => `<span>${item}</span>`).join("")}
        </div>
      </article>
    `)
    .join("");
}

function createCategoryCards() {
  categoryGrid.innerHTML = categories
    .map(category => `
      <article class="category-card ${state.category === category.title ? 'active' : ''}" data-category="${category.title}">
        <div class="category-icon">${category.icon}</div>
        <div>
          <h3>${category.title}</h3>
          <p>Premium ${category.title.toLowerCase()} parts</p>
        </div>
      </article>
    `)
    .join("");

  categoryGrid.querySelectorAll(".category-card").forEach(card => {
    card.addEventListener("click", () => {
      const selected = card.dataset.category;
      state.category = state.category === selected ? null : selected;
      createCategoryCards();
      renderParts();
      renderInventory();
    });
  });
}

function getFilteredParts() {
  return parts
    .filter(part => {
      if (state.category && part.category !== state.category) return false;
      if (state.vehicle && part.vehicle !== state.vehicle) return false;
      if (state.location && part.city !== state.location) return false;
      if (state.stock !== 'all' && part.stock.toLowerCase().replace(' ', '-') !== state.stock) return false;
      if (state.query && !(`${part.title} ${part.brand} ${part.shop}`.toLowerCase().includes(state.query.toLowerCase()))) return false;
      return true;
    })
    .sort((a, b) => {
      if (state.sort === 'price-asc') return a.price - b.price;
      if (state.sort === 'price-desc') return b.price - a.price;
      if (state.sort === 'distance-asc') return a.distance - b.distance;
      return 0;
    });
}

function renderParts() {
  const filtered = getFilteredParts();
  partsGrid.innerHTML = filtered
    .map(part => {
      const stockClass = part.stock === 'In stock' ? 'stock-in' : part.stock === 'Low' ? 'stock-low' : 'stock-out';
      return `
        <article class="part-card">
          <div class="part-image" style="background-image:url('${part.image}');"></div>
          <div class="part-meta">
            <div class="part-tag">${part.brand}</div>
            <h3>${part.title}</h3>
            <p>${part.category} · ${part.vehicle}</p>
            <div class="part-footer">
              <span class="part-price">₹${part.price}</span>
              <span class="stock-badge ${stockClass}">${part.stock}</span>
            </div>
            <button class="btn btn-outline btn-sm">Check Availability</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderInventory() {
  const filtered = getFilteredParts();
  resultCount.textContent = `${filtered.length} results`;
  inventoryCards.innerHTML = filtered
    .map(part => {
      const stockClass = part.stock === 'In stock' ? 'stock-in' : part.stock === 'Low' ? 'stock-low' : 'stock-out';
      return `
        <article class="inventory-card">
          <div>
            <h3>${part.title}</h3>
            <p>${part.shop} · ${part.city}</p>
          </div>
          <div class="meta-row">
            <div><span>Distance</span><strong>${part.distance.toFixed(1)} km</strong></div>
            <div><span>Stock</span><strong class="stock-badge ${stockClass}">${part.stock}</strong></div>
            <div><span>Price</span><strong>₹${part.price}</strong></div>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderLocationOptions() {
  locationSelect.innerHTML = locations.map(loc => `<option value="${loc}">${loc}</option>`).join("");
  locationSelect.value = state.location;
  stockSelect.value = state.stock;
  sortSelect.value = state.sort;
}

function bindEvents() {
  document.querySelectorAll('.toggle-btn').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      state.vehicle = button.dataset.vehicle;
      renderParts();
      renderInventory();
    });
  });

  locationSelect.addEventListener('change', () => {
    state.location = locationSelect.value;
    renderParts();
    renderInventory();
  });

  stockSelect.addEventListener('change', () => {
    state.stock = stockSelect.value;
    renderParts();
    renderInventory();
  });

  sortSelect.addEventListener('change', () => {
    state.sort = sortSelect.value;
    renderParts();
    renderInventory();
  });

  searchInput.addEventListener('input', () => {
    state.query = searchInput.value;
    renderParts();
    renderInventory();
  });

  findPartsBtn.addEventListener('click', () => {
    renderInventory();
    document.getElementById('inventorySection').scrollIntoView({ behavior: 'smooth' });
  });

  exploreBtn.addEventListener('click', () => {
    document.getElementById('partsSection').scrollIntoView({ behavior: 'smooth' });
  });

  browseBtn.addEventListener('click', () => {
    document.getElementById('categoriesSection').scrollIntoView({ behavior: 'smooth' });
  });
}

function init() {
  createBrandCards();
  createCategoryCards();
  renderLocationOptions();
  renderParts();
  renderInventory();
  bindEvents();
}

init();
