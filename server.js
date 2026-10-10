
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
app.use(cors({
  origin: "https://hicham1994339.github.io"
}));
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.get("/", (req, res) => {
  res.send("خادم عيادة الأسنان يعمل");
});

app.get("/api/patients", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, full_name, phone, birth_date, gender, address, medical_notes, created_at FROM patients ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "تعذر جلب المرضى" });
  }
});

app.post("/api/patients", async (req, res) => {
  try {
    const { full_name, phone, birth_date, gender, address, medical_notes } = req.body;

    if (!full_name || !full_name.trim()) {
      return res.status(400).json({ error: "اسم المريض مطلوب" });
    }

    const result = await pool.query(
      `INSERT INTO patients
       (full_name, phone, birth_date, gender, address, medical_notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, full_name, phone, birth_date, gender, address, medical_notes, created_at`,
      [
        full_name.trim(),
        phone || null,
        birth_date || null,
        gender || null,
        address || null,
        medical_notes || null
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "تعذر حفظ المريض" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
