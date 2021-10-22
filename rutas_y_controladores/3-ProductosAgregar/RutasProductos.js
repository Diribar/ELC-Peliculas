//************************* Requires *******************************
let express = require("express");
let router = express.Router();
let API = require("./ControllerAPI");
let agregar = require("./ControllerVista");

//************************ Middlewares ******************************
let usuarios = require("../../middlewares/usuarios/soloUsuarios");
let autorizadoFA = require("../../middlewares/usuarios/autorizadoFA");
let prodEnBD = require("../../middlewares/varios/productoYaEnBD");
let upload = require("../../middlewares/varios/multer");

//************************ Controladores ****************************
// Controladores de APIs
// Validar campos vs. sintaxis
router.get("/api/palabras-clave/", API.validarPalabrasClave);
router.get("/api/validar-copiar-fa/", API.validarCopiarFA);
router.get("/api/validar-datos-duros/", API.validarDatosDuros);
router.get("/api/validar-datos-pers/", API.validarDatosPers);
router.get("/api/obtener-fa-id/", API.obtenerFA_id);
router.get("/api/obtener-elc-id/", API.obtenerELC_id);

// Validar campos vs. API/BD
router.get("/api/averiguar-cant-prod/", API.cantProductos);

// Controladores de vistas de "Agregar Productos"
router.get("/palabras-clave", usuarios, agregar.palabrasClaveForm);
router.post("/palabras-clave", usuarios, agregar.palabrasClaveGuardar);
router.get("/desambiguar", usuarios, agregar.desambiguarForm);
router.post("/desambiguar", usuarios, agregar.desambiguarGuardar);
router.get("/copiar-fa", usuarios, autorizadoFA, agregar.copiarFA_Form);
router.post("/copiar-fa", usuarios, agregar.copiarFA_Guardar);
router.get("/datos-duros", usuarios, prodEnBD, agregar.datosDurosForm);
router.post("/datos-duros", usuarios, upload.single("avatar"), agregar.DDG);
router.get("/datos-personalizados", usuarios, prodEnBD, agregar.datosPersForm);
router.post("/datos-personalizados", usuarios, agregar.datosPersGuardar);
router.get("/resumen", usuarios, prodEnBD, agregar.resumenForm);
router.post("/resumen", usuarios, agregar.resumenGuardar);

// Controladores de vistas auxiliares
router.get("/responsabilidad", usuarios, agregar.responsabilidad);
router.get("/ya-en-bd", usuarios, agregar.yaEnBD_Form); //router.post("/ya-en-bd", usuarios, agregar.yaEnBD_Form);

// Fin
module.exports = router;
