var express = require('express');
var router = express.Router();
const models = require('../models/');
let jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const uuid = require('uuid');
const { body, validationResult,isDate } = require('express-validator');
const ProductController = require('../controls/ProductController');
var productController = new ProductController();
const WarehouseController = require('../controls/WarehouseController');
var warehouseController = new WarehouseController();

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

// GUARDAR IMAGENES 

// Función para crear configuraciones de almacenamiento de multer
const createStorage = (folderPath) => {
  return multer.diskStorage({
    destination: path.join(__dirname, folderPath),
    filename: (req, file, cb) => {
      console.log(file);
      const parts = file.originalname.split('.');
      const extension = parts[parts.length - 1];
      cb(null, uuid.v4() + "." + extension);
    }
  });
};

// Método para validar las extensiones de las fotografías
const extensionesAceptadasFoto = (req, file, cb) => {
  const allowedExtensions = ['.jpeg', '.jpg', '.png'];
  console.log(file);
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos JPEG, JPG y PNG.'), false);
  }
};

// Configuración de Multer con control de tamaño y tipo de archivo
const uploadFoto = (folderPath) => {
  const storage = createStorage(folderPath);
  return multer({
    storage: storage,
    fileFilter: extensionesAceptadasFoto,
    limits: {
      fileSize: 2 * 1024 * 1024  // 5MB
    }
  });
};

// Ejemplos de uso
const uploadFotoPersona = uploadFoto('../public/images/users');
const uploadFotoProducto = uploadFoto('../public/images/products');

/** RUTAS A USAR */

/** PRODUCTO */
router.post('/registrar/producto', uploadFotoProducto.single('photo'), (req, res, next) => {
  // Si llega a este punto, significa que no hubo error de Multer
  productController.save(req, res);
}, (error, req, res, next) => {
  // Manejo de errores de Multer
  if (error instanceof multer.MulterError) {
      // Verificamos si el error es por tamaño del archivo
      if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({
              msg: "El archivo es demasiado grande. Por favor, sube un archivo de menos de 2 MB.",
              code: 413
          });
      }
      // Asegúrate de manejar otros tipos de errores de Multer aquí, si necesario
      return res.status(400).json({
          msg: "Error de Multer: " + error.message,
          code: 400
      });
  }
  // Para otros tipos de errores que no son de Multer, continúa al próximo middleware de error
  next(error);
});

router.post('/actualizar/producto', uploadFotoProducto.single('photo'), (req, res, next) => {
  // Si llega a este punto, significa que no hubo error de Multer
  productController.update(req, res);
}, (error, req, res, next) => {
  // Manejo de errores de Multer
  if (error instanceof multer.MulterError) {
      // Verificamos si el error es por tamaño del archivo
      if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({
              msg: "El archivo es demasiado grande. Por favor, sube un archivo de menos de 2 MB.",
              code: 413
          });
      }
      // Asegúrate de manejar otros tipos de errores de Multer aquí, si necesario
      return res.status(400).json({
          msg: "Error de Multer: " + error.message,
          code: 400
      });
  }
  // Para otros tipos de errores que no son de Multer, continúa al próximo middleware de error
  next(error);
});

router.get('/listar/producto', productController.list);
router.get('/obtener/producto/:external',  productController.getProduct);

/** BODEGA */
router.post('/registrar/bodega', warehouseController.save);
router.post('/actualizar/bodega',  warehouseController.update);
router.get('/listar/bodega', warehouseController.list);
router.get('/obtener/bodega/:external', warehouseController.getWarehouse);

