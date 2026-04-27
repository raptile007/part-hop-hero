import express from "express";
import cors from "cors";
import session from "express-session";
import MySQLStoreModule from "express-mysql-session";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config({ override: true });

const {
  DB_HOST = "localhost",
  DB_PORT = "3306",
  DB_USER = "root",
  DB_PASSWORD = "",
  DB_NAME = "bike_spares",
  SESSION_SECRET = "change_this_secret",
  GOOGLE_PLACES_KEY = "",
  FRONTEND_ORIGINS = "http://localhost:5173,http://localhost:8080",
  PORT = "4000",
} = process.env;

const allowedOrigins = FRONTEND_ORIGINS.split(",").map((origin) => origin.trim());
const app = express();
const port = Number(PORT);

const dbConfig = {
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USER,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  decimalNumbers: true,
};

if (DB_PASSWORD) {
  dbConfig.password = DB_PASSWORD;
}

const db = await mysql.createPool(dbConfig);

const MySQLStore = MySQLStoreModule(session);
const sessionStore = new MySQLStore({
  expiration: 24 * 60 * 60 * 1000,
  createDatabaseTable: true,
}, db);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());
app.use(session({
  secret: SESSION_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
}));

async function initSchema() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(200) NOT NULL UNIQUE,
      password_hash VARCHAR(200) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS shops (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      address VARCHAR(255) NOT NULL,
      location VARCHAR(100) NOT NULL,
      latitude DECIMAL(10,7) NOT NULL,
      longitude DECIMAL(10,7) NOT NULL
    ) ENGINE=InnoDB;
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS parts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      shop_id INT NOT NULL,
      part_name VARCHAR(150) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      stock INT NOT NULL DEFAULT 0,
      category VARCHAR(80) DEFAULT 'General',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      part_id INT NOT NULL,
      shop_id INT NOT NULL,
      quantity INT NOT NULL,
      total_price DECIMAL(10,2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE CASCADE,
      FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  const [shops] = await db.query("SELECT id FROM shops LIMIT 1");
  if (Array.isArray(shops) && shops.length === 0) {
    await db.query(`
      INSERT INTO shops (name, address, location, latitude, longitude) VALUES
      ('FastTrack Bike Service', '12 Green Lane', 'Downtown', 28.6139, 77.2090),
      ('Rider Repair Hub', '81 Central Street', 'Uptown', 28.6200, 77.2200),
      ('WheelWorks Garage', '34 East Park Road', 'Eastside', 28.6105, 77.2305);
    `);

    await db.query(`
      INSERT INTO parts (shop_id, part_name, price, stock, category) VALUES
      (1, 'Brake Pad Set', 650.00, 25, 'Brakes'),
      (1, 'Spark Plug', 180.00, 40, 'Engine'),
      (2, 'Chain Lubricant', 280.00, 55, 'Consumables'),
      (2, 'Air Filter', 350.00, 20, 'Engine'),
      (3, 'Front Tire', 2500.00, 10, 'Wheels'),
      (3, 'Battery 12V', 3200.00, 15, 'Electrical');
    `);
  }
}

function ensureAuthenticated(req, res, next) {
  if (req.session.userId) return next();
  return res.status(401).json({ error: "Not authenticated" });
}

app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required." });
  }

  const password_hash = await bcrypt.hash(password, 10);
  try {
    const [result] = await db.query(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name, email.toLowerCase(), password_hash],
    );
    const userId = result.insertId;
    req.session.userId = userId;
    req.session.userName = name;
    return res.json({ id: userId, name, email });
  } catch (error) {
    return res.status(400).json({ error: "Email already exists" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const [rows] = await db.query("SELECT id, name, email, password_hash FROM users WHERE email = ?", [email.toLowerCase()]);
  const user = Array.isArray(rows) && rows[0];
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) return res.status(401).json({ error: "Invalid credentials" });

  req.session.userId = user.id;
  req.session.userName = user.name;
  return res.json({ id: user.id, name: user.name, email: user.email });
});

app.post("/api/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ success: true });
  });
});

app.get("/api/auth/session", async (req, res) => {
  if (!req.session.userId) return res.json({ user: null });
  const [rows] = await db.query("SELECT id, name, email FROM users WHERE id = ?", [req.session.userId]);
  const user = Array.isArray(rows) && rows[0] ? rows[0] : null;
  return res.json({ user });
});

app.get("/api/locations", async (req, res) => {
  const [rows] = await db.query("SELECT DISTINCT location FROM shops ORDER BY location");
  return res.json({ locations: Array.isArray(rows) ? rows.map((row) => row.location) : [] });
});

app.get("/api/parts", async (req, res) => {
  const { location } = req.query;
  let query = `
    SELECT p.id, p.part_name, p.price, p.stock, p.category,
      s.id AS shop_id, s.name AS shop_name, s.address, s.location AS shop_location,
      s.latitude, s.longitude
    FROM parts p
    JOIN shops s ON p.shop_id = s.id
  `;
  const params = [];
  if (location) {
    query += " WHERE s.location = ?";
    params.push(location);
  }
  query += " ORDER BY s.location, p.part_name";
  const [rows] = await db.query(query, params);
  return res.json({ parts: Array.isArray(rows) ? rows.map((row) => ({
    id: row.id,
    part_name: row.part_name,
    price: Number(row.price),
    stock: row.stock,
    category: row.category,
    shop: {
      id: row.shop_id,
      name: row.shop_name,
      address: row.address,
      location: row.shop_location,
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
    },
  })) : [] });
});

app.get("/api/orders", ensureAuthenticated, async (req, res) => {
  const [rows] = await db.query(
    `SELECT o.id, o.quantity, o.total_price, o.created_at,
      p.part_name, s.name AS shop_name, s.location AS shop_location
     FROM orders o
     JOIN parts p ON o.part_id = p.id
     JOIN shops s ON o.shop_id = s.id
     WHERE o.user_id = ?
     ORDER BY o.created_at DESC
    `,
    [req.session.userId],
  );
  return res.json({ orders: Array.isArray(rows) ? rows : [] });
});

app.post("/api/orders", ensureAuthenticated, async (req, res) => {
  const { partId, quantity = 1 } = req.body;
  const parsedQuantity = Number(quantity) || 1;
  if (!partId || parsedQuantity < 1) {
    return res.status(400).json({ error: "Please select a valid quantity." });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [partRows] = await connection.query(
      "SELECT id, stock, price, shop_id FROM parts WHERE id = ? FOR UPDATE",
      [partId],
    );
    const part = Array.isArray(partRows) && partRows[0];
    if (!part) {
      await connection.rollback();
      return res.status(404).json({ error: "Part not found." });
    }
    if (part.stock < parsedQuantity) {
      await connection.rollback();
      return res.status(400).json({ error: "Not enough stock available." });
    }

    const totalPrice = Number(part.price) * parsedQuantity;
    await connection.query(
      "UPDATE parts SET stock = stock - ? WHERE id = ?",
      [parsedQuantity, partId],
    );
    await connection.query(
      "INSERT INTO orders (user_id, part_id, shop_id, quantity, total_price) VALUES (?, ?, ?, ?, ?)",
      [req.session.userId, partId, part.shop_id, parsedQuantity, totalPrice],
    );
    await connection.commit();

    return res.json({ success: true, message: "Order placed successfully.", totalPrice });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({ error: "Unable to place order." });
  } finally {
    connection.release();
  }
});

app.get("/api/mechanics", async (req, res) => {
  const lat = req.query.lat;
  const lng = req.query.lng;
  if (!lat || !lng) {
    return res.status(400).json({ error: "Latitude and longitude are required." });
  }
  if (!GOOGLE_PLACES_KEY) {
    return res.status(500).json({ error: "Google Places API key is not configured." });
  }

  const placesUrl = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
  placesUrl.searchParams.set("location", `${lat},${lng}`);
  placesUrl.searchParams.set("radius", "5000");
  placesUrl.searchParams.set("keyword", "bike mechanic");
  placesUrl.searchParams.set("type", "car_repair");
  placesUrl.searchParams.set("key", GOOGLE_PLACES_KEY);

  const response = await fetch(placesUrl.toString());
  const payload = await response.json();
  return res.json(payload);
});

app.get("/api/shops", async (req, res) => {
  const [rows] = await db.query("SELECT id, name, address, location, latitude, longitude FROM shops ORDER BY name");
  return res.json({ shops: Array.isArray(rows) ? rows : [] });
});

app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

await initSchema();

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
