var express = require('express');
var router = express.Router();
let jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;

var auth = function middleware(req, res, next) {
  const token = req.headers['x-api-token'];
  //console.log(req.headers);
  if (token) {
    require('dotenv').config();
    const llave = process.env.KEY;
    jwt.verify(token, llave, async (err, decoded) => {
      if (err) {
        console.log('aqui', err);
        res.status(401);
        res.json({ msg: "Token no valido!", code: 401 });
      } else {
        var models = require('../models');
        var cuenta = models.cuenta;
        req.decoded = decoded;
        console.log("Aca\n\n");
        console.log(decoded);
        let aux = await cuenta.findOne({ where: { external_id: req.decoded.external } });
        if (aux) {
          next();
        } else {
          res.status(401);
          res.json({ msg: "Token no valido!", code: 401 });
        }
      }

    });
  } else {
    res.status(401);
    res.json({ msg: "No existe token!", code: 401 });
  }
}

//Usar este para modulos de admin
var authAdmin = function middleware(req, res, next) {
  const token = req.headers['x-api-token'];
  console.log(token);
  
  if (token) {
    
    require('dotenv').config();
    const llave = process.env.KEY;
    jwt.verify(token, llave, async (err, decoded) => {
      if (err) {
        console.log('aqui', err);
        res.status(401);
        res.json({ msg: "Token no validoo!", code: 401 });
      } else {
        var models = require('../models');
        var cuenta = models.cuenta;
        req.decoded = decoded;
        console.log("Aca\n\n");
        console.log(decoded);
        if (decoded.rol_nombre == "admin") {
          let aux = await cuenta.findOne({ where: { external_id: req.decoded.external } });
          if (aux) {
            next();
          } else {
            res.status(401);
            res.json({ msg: "Token no valido!", code: 401 });
          }
        } else {
          
          res.status(401);
            res.json({ msg: "Token no valido!", code: 401 });
        }
      }

    });
  } else {
    
    res.status(401);
    res.json({ msg: "No existe token!", code: 401 });
  }
}

// GUARDAR IMAGENES USUARIOS
const storage_foto_persona = ()=>multer.diskStorage({
 
  destination: path.join(__dirname,'../public/images/users'),
  filename: (req, file, cb) => {
    console.log(file);
    const partes = file.originalname.split('.');
    const extension = partes[partes.length - 1];
    cb(null, uuid.v4()+"."+extension);
  }
 
});

const extensiones_aceptadas_foto = (req, file, cb) => {
  const allowedExtensions = ['.jpeg','.jpg', '.png'];
  console.log(file);
  const ext = path.extname(file.originalname);
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos JPEG, JPG y PNG.'));
  }
};

const upload_foto_persona = multer({ storage: storage_foto_persona(), fileFilter: extensiones_aceptadas_foto });
