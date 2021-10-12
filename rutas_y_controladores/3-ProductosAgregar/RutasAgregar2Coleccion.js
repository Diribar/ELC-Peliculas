//************************* Requires *******************************
let express = require("express");
let router = express.Router();
let API = require("./1-Agregar-API");
let vistas = require("./1-Agregar2Colecciones");

//************************ Middlewares ******************************
let usuarios = require("../../middlewares/usuarios/soloUsuarios");
let prodEnBD = require("../../middlewares/varios/productoYaEnBD");

//********************* Otros Middlewares ***************************
let upload = require("../../middlewares/varios/multer");

//************************ Controladores ****************************
// Controladores de APIs
// Validar campos vs. sintaxis
router.get("/api/validar-datos-duros/", API.validarDatosDuros);
router.get("/api/validar-datos-pers/", API.validarDatosPers);
// Validar campos vs. API/BD
router.get("/api/averiguar-cant-prod/", API.cantProductos);
//router.get("/api/averiguar-fa-ya-en-bd/", API.averiguarYaEnBD_FA);

// Controladores de vistas de "Agregar Productos"
router.get("/datos-duros", usuarios, prodEnBD, vistas.datosDurosForm);
router.post("/datos-duros", usuarios, upload.single("avatar"), vistas.datosDurosGuardar);
router.get("/datos-personalizados", usuarios, prodEnBD, vistas.DatosPersForm);
router.post("/datos-personalizados", usuarios, vistas.DatosPersGuardar);
router.get("/resumen", usuarios, prodEnBD, vistas.ResumenForm);
router.post("/resumen", usuarios, vistas.ResumenGuardar);

// Controladores de vistas auxiliares

// Fin
module.exports = router;
