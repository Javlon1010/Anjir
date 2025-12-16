const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const cors = require("cors");
const fs = require("fs");

// ⚠️ Load environment variables from .env (if present)
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// 🔐 Telegram ma'lumotlari
const TOKEN = "8119491112:AAEnp06vkAXdY-6kEnRXKbzIFJjZDufznYY";
const CHAT_ID = "6652899566";


// 🔧 Middleware
app.use(cors());
app.use(bodyParser.json());

// 🗂 Fayllar mavjud bo‘lishi kerak
if (!fs.existsSync("orders.json")) fs.writeFileSync("orders.json", "[]", "utf-8");
if (!fs.existsSync("products.json")) fs.writeFileSync("products.json", "[]", "utf-8");

// 🔌 MongoDB konfiguratsiyasi (agar kerak bo‘lsa .env fayliga MONGODB_URI qo‘shing)
const mongoose = require("mongoose");
const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/anjir";

// Product schema va model
const productSchema = new mongoose.Schema({
  id: { type: Number, unique: true, required: true },
  name: String,
  price: String,
  image: String,
  category: String,
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("✅ MongoDB connected");

    // Agar DB bo‘sh bo‘lsa va products.json mavjud bo‘lsa, bir martalik import
    try {
      const count = await Product.countDocuments();
      if (count === 0 && fs.existsSync("products.json")) {
        const existing = JSON.parse(fs.readFileSync("products.json", "utf-8"));
        if (Array.isArray(existing) && existing.length > 0) {
          await Product.insertMany(existing);
          console.log(`✅ Imported ${existing.length} products from products.json`);
        }
      }
    } catch (err) {
      console.error("Import error:", err);
    }
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// ======================================================
// 🧾 BUYURTMALAR
// ======================================================

// 🛒 Buyurtma yuborish
app.post("/api/order", async (req, res) => {
  const { name, phone, address, cart, total } = req.body;

  // Validatsiya
  if (!name || !phone || !address || !cart || cart.length === 0) {
    return res.status(400).json({ error: "Ma'lumotlar to‘liq emas" });
  }

  const order = {
    id: Date.now(),
    name,
    phone,
    address,
    cart,
    total,
    status: "Yangi",
    date: new Date().toLocaleString("uz-UZ"),
  };

  const orders = JSON.parse(fs.readFileSync("orders.json", "utf-8"));
  orders.push(order);
  fs.writeFileSync("orders.json", JSON.stringify(orders, null, 2), "utf-8");

  // Telegramga yuborish
  let text = `🛒 <b>Yangi buyurtma!</b>\n\n`;
  text += `👤 <b>Ism:</b> ${name}\n`;
  text += `📞 <b>Telefon:</b> ${phone}\n`;
  text += `🏠 <b>Manzil:</b> ${address}\n\n`;
  text += `<b>Mahsulotlar:</b>\n`;
  cart.forEach((item) => {
    text += `• ${item.name} — ${item.price}\n`;
  });
  text += `\n💰 <b>Jami:</b> ${total.toLocaleString()} so‘m`;

  try {
    await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: "HTML",
      }),
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Telegram xatosi:", error);
    res.status(500).json({ error: "Telegramga yuborilmadi" });
  }
});

// 🔹 Buyurtmalarni olish
app.get("/api/orders", (req, res) => {
  const orders = JSON.parse(fs.readFileSync("orders.json", "utf-8"));
  res.json(orders);
});

// 🔹 Buyurtma holatini yangilash
app.post("/api/orders/update", (req, res) => {
  const { id, status } = req.body;

  const orders = JSON.parse(fs.readFileSync("orders.json", "utf-8"));
  const index = orders.findIndex((o) => o.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Buyurtma topilmadi" });
  }

  orders[index].status = status;
  fs.writeFileSync("orders.json", JSON.stringify(orders, null, 2), "utf-8");

  res.json({ success: true });
});

// ======================================================
// 🛍 MAHSULOTLAR (MongoDB orqali)
// ======================================================

// 🔹 Barcha mahsulotlarni olish
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server xatosi" });
  }
});

// ➕ Yangi mahsulot qo‘shish
app.post("/api/products/add", async (req, res) => {
  try {
    const { name, price, image, category } = req.body;

    if (!name || !price || !image || !category)
      return res.status(400).json({ error: "Ma'lumotlar to‘liq emas" });

    const newProduct = new Product({ id: Date.now(), name, price, image, category });
    await newProduct.save();

    res.json({ success: true, product: newProduct });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server xatosi" });
  }
});

// ❌ Mahsulotni o‘chirish
app.post("/api/products/delete", async (req, res) => {
  try {
    const { id } = req.body;
    const idNum = Number(id);
    await Product.findOneAndDelete({ id: idNum });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server xatosi" });
  }
});

// ✏️ Mahsulotni tahrirlash
app.post("/api/products/edit", async (req, res) => {
  try {
    let { id, name, price, image, category } = req.body;
    const idNum = Number(id);

    const product = await Product.findOneAndUpdate(
      { id: idNum },
      { name, price, image, category },
      { new: true }
    );

    if (!product) return res.status(404).json({ error: "Mahsulot topilmadi" });

    res.json({ success: true, product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server xatosi" });
  }
});

// ======================================================
// 🚀 SERVERNI ISHGA TUSHIRISH
// ======================================================
app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT}-portda ishga tushdi!`);
});
