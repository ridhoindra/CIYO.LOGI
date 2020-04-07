const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const mysql = require('mysql')
const jwt = require('jsonwebtoken')
const port = 3000

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "PKK"
  });
  db.connect(err => {
    if (err) throw err;
    console.log("Database connected");
  });

  const isAuthorized = (request, result, next) => {
    if (typeof request.headers["token"] == "undefined") {
      return result.status(403).json({
        success: false,
        message: "Silahkan Login terlebih dahulu"
      });
    }
  
    let token = request.headers["token"];
  
    jwt.verify(token, "SuperSecRetKey", (err, decoded) => {
      if (err) {
        return result.status(401).json({
          success: false,
          message: "Silahkan login terlebih dahulu"
        });
      }
    });
  
    next();
  };

//   User

app.post("/login", (req, res) => {
    //membuat end point untuk login akun
    var email = req.body.email; // mengimpor email dari form
    var password = req.body.password; //mengimpor password dari form
    const sql = "SELECT * FROM akun WHERE email = ? AND password = ?"; // mencocokkan data form dengan data tabel
    if (email && password) {
      // jika email dan password ada
      db.query(sql, [email, password], function(err, rows) {
        if (err) throw err;
        // jika error akan menampilkan errornya
        else if (rows.length > 0) {
          // jika kolom lebih dari 0
          jwt.sign(
            // mengenkripsi data menggunakan jwt
            { email, password },
            "SuperSecRetKey",
            {
              expiresIn: 60 * 60 * 7 // waktu durasi token yang dikeluarkan
            },
            (err, token) => {
              res.send(token); // menampilkan token yang sudah ada
            }
          );
        } else {
          res.json({
            message: "Email atau Password salah"
          }); // jika semua if tidak terpenuhi maka menampilkan kalimat tersebut
        }
      });
    }
  });
  

app.post("/daftar", (req, res) => {
    // membuat end point untuk daftar akun
    var data = {
      // membuat variabel data
      nama: req.body.nama, // mengambil data nama dari form
      email: req.body.email, // mengambil data email dari form
      password: req.body.password, // mengambil data password dari form
      no_telp: req.body.telepon,
      alamat: req.body.alamat
    };
    db.query("INSERT INTO akun SET?", data, function(err, result) {
      // memasukkan data form ke tabel database
      if (err) throw err;
      // jika gagal maka akan keluar error
      else {
        res.json({
          success: true,
          message: "Data user masuk"
        });
      }
    });
  });