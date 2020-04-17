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
    database: "pkk"
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

  app.post("/login/admin", (req, res, next) => {
    //membuat end point untuk login akun
    var username = req.body.username; // mengimpor email dari form
    var password = req.body.password; //mengimpor password dari form
    const sql = "SELECT * FROM admin WHERE username = ? AND password = ?"; // mencocokkan data form dengan data tabel
    if (username && password) {
      // jika email dan password ada
      db.query(sql, [username, password], function(err, rows) {
        if (err) throw err;
        // jika error akan menampilkan errornya
        else if (rows.length > 0) {
          jwt.sign(
            { username, password },
            "SuperSecRetKey",
            {
              expiresIn: 60 * 60 * 6
            },
            (err, token) => {
              res.send(token);
            }
          );
        } else {
          res.json({
            message: "Username atau Password salah"
          }); // jika semua if tidak terpenuhi maka menampilkan kalimat tersebut
        }
      });
    }
  });

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

  app.put("/editUser/:id",isAuthorized, function(req, res) {
    let data = // membuat variabel data yang berisi sintaks untuk mengupdate tabel di database
      'UPDATE akun SET nama="' +
      req.body.nama +
      '", alamat="' +
      req.body.alamat +
      '", password="' +
      req.body.password +
      '", no_telp="' +
      req.body.telepon +
      '", email="' +
      req.body.email +
      '" where id=' +
      req.params.id;
    db.query(data, function(err, result) {
      // mengupdate data di database
      if (err) throw err;
      // jika gagal maka akan keluar error
      else {
        res.json({
          success: true,
          message: "Data berhasil diupdate"
        });
      }
    });
  });
  
  app.delete("/deleteUser/:id",isAuthorized, function(req, res) {
    // membuat end point delete
    let id = "delete from akun where id=" + req.params.id;
  
    db.query(id, function(err, result) {
      // mengupdate data di database
      if (err) throw err;
      // jika gagal maka akan keluar error
      else {
        res.json({
          success: true,
          message: "Data berhasil dihapus"
        });
      }
    });
  });

  // Diary

  app.post("/diary/:id",isAuthorized, function(req, res) {
    let data = req.body;
  
    var diary = {
      idUser: req.params.id, // mengambil data dari form
      diary: data.diary, // mengambil data dari form
    };
  
    db.query("insert into diary set ?", diary, (err, result) => {
      if (err) throw err;
    });
  
    res.json({
      success: true,
      message: "Diary user telah masuk"
    });
  });

  app.get("/diary/:idUser",isAuthorized, (req, res) => {
    db.query(`select * from diary where idUser=`+req.params.idUser,
      (err, result) => {
        if (err) throw err;
  
        res.json({
          message: "berhasil menampilkan diary dengan id = "+req.params.idUser,
          data: result
        });
      }
    );
  });

  app.put("/diary/edit/:idUser/:idDiary",isAuthorized,(req,res)=>{
    let data = // membuat variabel data yang berisi sintaks untuk mengupdate tabel di database
    'UPDATE diary SET diary="' +req.body.diary +'" where id=' +req.params.idDiary+' AND idUser='+req.params.idUser;
  db.query(data, function(err, result) {
    // mengupdate data di database
    if (err) throw err;
    // jika gagal maka akan keluar error
    else {
      res.json({
        success: true,
        message: "Diary berhasil diupdate"
      });
    }
  });
  })

  app.delete("/diary/delete/:idUser/:idDiary",isAuthorized, function(req, res) {
    // membuat end point delete
    let id = 'delete from diary where id=' +req.params.idDiary+' AND idUser='+req.params.idUser;
  
    db.query(id, function(err, result) {
      // mengupdate data di database
      if (err) throw err;
      // jika gagal maka akan keluar error
      else {
        res.json({
          success: true,
          message: "diary berhasil dihapus"
        });
      }
    });
  });

  app.listen(port, () => console.log(`PORT 3000 Sam!!!`))