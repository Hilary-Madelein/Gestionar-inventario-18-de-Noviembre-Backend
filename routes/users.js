var express = require('express');
var router = express.Router();
const models = require('../models/');
let jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const uuid = require('uuid');
const { body, validationResult, isDate } = require('express-validator');
const WarehouseFacade = require('../facades/WarehouseFacade');
const KardexFacade = require('../facades/KardexFacade');
const ItemKardexFacade = require('../facades/ItemKardexFacade');
const BatchFacade = require('../facades/BatchFacade');
const ProductFacade = require('../facades/ProductFacade');
const LocationFacade = require('../facades/LocationFacade');

/* GET users listing. */
router.get('/', function (req, res, next) {
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
router.post('/registrar/producto', uploadFotoProducto.single('photo'), async (req, res, next) => {
  try {
      const response = await ProductFacade.createProduct(req);
      res.status(response.code).json(response);
  } catch (error) {
      res.status(500).json({ msg: 'Error en la transacción: ' + error.message });
  }
}, (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({
              msg: "El archivo es demasiado grande. Por favor, sube un archivo de menos de 2 MB.",
              code: 413
          });
      }
      return res.status(400).json({
          msg: "Error de Multer: " + error.message,
          code: 400
      });
  }
  next(error);
});

router.post('/actualizar/producto', uploadFotoProducto.single('photo'), async (req, res, next) => {
  try {
      const response = await ProductFacade.updateProduct({ req });
      res.status(response.code).json(response);
  } catch (error) {
      res.status(500).json({ msg: 'Error en la transacción: ' + error.message });
  }
}, (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({
              msg: "El archivo es demasiado grande. Por favor, sube un archivo de menos de 2 MB.",
              code: 413
          });
      }
      return res.status(400).json({
          msg: "Error de Multer: " + error.message,
          code: 400
      });
  }
  next(error);
});

router.get('/listar/producto', async (req, res) => {
  const response = await ProductFacade.listProducts();
  res.status(response.code).json(response);
});
router.get('/obtener/producto', async (req, res) => {
  const response = await ProductFacade.getProduct(req.query.externalId);
  res.status(response.code).json(response);
});

/** BODEGA */
router.get('/listar/bodegas', async (req, res) => {
  const response = await WarehouseFacade.listWarehouses();
  res.status(response.code).json(response);
});

router.get('/obtener/bodega', async (req, res) => {
  const response = await WarehouseFacade.getWarehouse(req.query.externalId);
  res.status(response.code).json(response);
});

router.post('/crear/bodega', async (req, res) => {
  try {
      const response = await WarehouseFacade.createWarehouse(req);
      res.status(response.code).json(response);
  } catch (error) {
      res.status(500).json({ msg: 'Error al crear la bodega: ' + error.message });
  }
});

router.post('/actualizar/bodega', async (req, res) => {
  const response = await WarehouseFacade.updateWarehouse(req.body);
  res.status(response.code).json(response);
});

/** KARDEX */
router.get('/listar/kardex', async (req, res) => {
  const response = await KardexFacade.listKardex();
  res.status(response.code).json(response);
});

router.get('/obtener/kardex', async (req, res) => {
  const response = await KardexFacade.getKardex(req.query.externalId);
  res.status(response.code).json(response);
});

router.post('/crear/kardex', async (req, res) => {
  try {
      const response = await KardexFacade.createKardex(req.body);
      res.status(response.code).json(response);
  } catch (error) {
      res.status(500).json({ msg: 'Error en la transacción: ' + error.message });
  }
});

/** ITEM KARDEX */
router.post('/registrarEntradaExterna/itemKardex', async (req, res) => {
  try {
      const response = await ItemKardexFacade.createItemKardexExternalInput(req.body);
      res.status(response.code).json(response);
  } catch (error) {
      res.status(500).json({ msg: 'Error en la transacción: ' + error.message });
  }
});

router.post('/registrarSalidaExterna/itemKardex', async (req, res) => {
  try {
      const response = await ItemKardexFacade.createItemKardexExternalOutput(req.body);
      res.status(response.code).json(response);
  } catch (error) {
      res.status(500).json({ msg: 'Error en la transacción: ' + error.message });
  }
});

router.post('/obtener/entradas/items', async (req, res) => {
  const response = await ItemKardexFacade.getInputs(req.body);
  res.status(response.code).json(response);
});

router.post('/obtener/salidas/items', async (req, res) => {
  const response = await ItemKardexFacade.getOutputs(req.body);
  res.status(response.code).json(response);
});

router.post('/obtener/cantidad', async (req, res) => {
  const response = await ItemKardexFacade.getQualityInputs(req.body);
  res.status(response.code).json(response);
});

router.get('/obtener/existencia', async (req, res) => {
  const response = await ItemKardexFacade.getExistence();
  res.status(response.code).json(response);
});

/** LOTE */
router.get('/listar/lote', async (req, res) => {
  const response = await BatchFacade.listBatches();
  res.status(response.code).json(response);
});

router.get('/obtener/lote', async (req, res) => {
  const response = await BatchFacade.getBatch(req.query.externalId);
  res.status(response.code).json(response);
});

router.post('/crear/lote', async (req, res) => {
  try {
    const batch = await BatchFacade.createBatch(req.body);
    res.status(200).json({ msg: 'Lote creado con éxito', batch });
  } catch (error) {
    res.status(500).json({ msg: 'Error al crear lote: ' + error.message });
  }
});

router.post('/actualizar/lote', async (req, res) => {
  const response = await BatchFacade.updateBatch(req.body);
  res.status(response.code).json(response);
});

/** UBICACION */
/** UBICACIÓN */
router.get('/listar/ubicaciones', async (req, res) => {
  const response = await LocationFacade.listLocations();
  res.status(response.code).json(response);
});

router.get('/obtener/ubicacion', async (req, res) => {
  const response = await LocationFacade.getLocation(req.query.externalId);
  res.status(response.code).json(response);
});

router.post('/crear/ubicacion', async (req, res) => {
  try {
      const response = await LocationFacade.createLocation(req);
      res.status(response.code).json(response);
  } catch (error) {
      res.status(500).json({ msg: 'Error al crear la ubicación: ' + error.message });
  }
});

router.post('/actualizar/ubicacion', async (req, res) => {
  const response = await LocationFacade.updateLocation(req.body);
  res.status(response.code).json(response);
});