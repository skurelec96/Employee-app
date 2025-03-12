const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");

const app = express();
const port = 3000;

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "firma",
  port: 3306,
});

db.connect((err) => {
  if (err) {
    console.error(err);
  } else {
    console.log("Success");
  }
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/addEmployee", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "addEmployee.html"));
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

app.get("/employeesList", (req, res) => {
  db.query("SELECT * FROM radnici", (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.get("/editEmployee/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM radnici WHERE id = ?", [id], (err, results) => {
    if (err) {
      console.error("Error:", err);
    }

    if (results.length === 0) {
      return res.status(404).send("No employees");
    }

    res.sendFile(path.join(__dirname, "public", "editEmployee.html"));
  });
});

app.post("/updateEmployee", upload.single("image"), (req, res) => {
  const {
    id,
    first_name,
    last_name,
    gender,
    birth_year,
    start_date,
    contract_type,
    contract_duration,
    department,
    vacation_days,
    free_days,
    paid_leave_days,
    image_path
  } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : req.body.image_path;

  const query =
    "UPDATE radnici SET ime = ?, prezime = ?, spol = ?, godina_rodenja = ?, datum_pocetka = ?, vrsta_ugovora = ?, trajanje_ugovora = ?, odjel = ?, broj_dana_godisnjeg_odmora = ?, broj_slobodnih_dana = ?, broj_dana_placenog_dopusta = ?, putanja_slike = ? WHERE id = ?";

  db.query(
    query,
    [
      first_name,
      last_name,
      gender,
      birth_year,
      start_date,
      contract_type,
      contract_duration,
      department,
      vacation_days,
      free_days,
      paid_leave_days,
      imagePath,
      id,
    ],
    (err, results) => {
      if (err) throw err;
      res.redirect("/");
    }
  );
});

app.get("/employee/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM radnici WHERE id = ?", [id], (err, results) => {
    if (err) throw err;
    res.json(results[0]);
  });
});

app.post("/employee", upload.single("image"), (req, res) => {
  const {
    first_name,
    last_name,
    gender,
    birth_year,
    start_date,
    contract_type,
    contract_duration,
    department,
    vacation_days,
    free_days,
    paid_leave_days,
  } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : "";

  const query =
    "INSERT INTO radnici (ime, prezime, spol, godina_rodenja, datum_pocetka, vrsta_ugovora, trajanje_ugovora, odjel, broj_dana_godisnjeg_odmora, broj_slobodnih_dana, broj_dana_placenog_dopusta, putanja_slike) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

  db.query(
    query,
    [
      first_name,
      last_name,
      gender,
      birth_year,
      start_date,
      contract_type,
      contract_duration,
      department,
      vacation_days,
      free_days,
      paid_leave_days,
      imagePath
    ],
    (err, results) => {
      if (err) throw err;
      res.redirect("/");
    }
  );
});

app.listen(port, () => {
  console.log(`Running on port: ${port}`);
});
