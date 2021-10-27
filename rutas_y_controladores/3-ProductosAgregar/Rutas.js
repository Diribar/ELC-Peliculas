//************************* Requires *******************************
let express = require("express");
let router = express.Router();
let API = require("./ControllerAPI");
let vista = require("./ControllerVista");

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
router.get("/palabras-clave", usuarios, vista.palabrasClaveForm);
router.post("/palabras-clave", usuarios, vista.palabrasClaveGuardar);
router.get("/desambiguar", usuarios, vista.desambiguarForm);
router.post("/desambiguar", usuarios, vista.desambiguarGuardar);
router.get("/copiar-fa", usuarios, autorizadoFA, vista.copiarFA_Form);
router.post("/copiar-fa", usuarios, vista.copiarFA_Guardar);
router.get("/datos-duros", usuarios, prodEnBD, vista.datosDurosForm);
router.post("/datos-duros", usuarios, upload.single("avatar"), vista.DDG);
router.get("/datos-personalizados", usuarios, prodEnBD, vista.datosPersForm);
router.post("/datos-personalizados", usuarios, vista.datosPersGuardar);
router.get("/resumen", usuarios, prodEnBD, vista.resumenForm);
router.post("/resumen", usuarios, vista.resumenGuardar);

// Controladores de vistas auxiliares
router.get("/responsabilidad", usuarios, vista.responsabilidad);
router.get("/ya-en-bd", usuarios, vista.yaEnBD_Form); //router.post("/ya-en-bd", usuarios, vista.yaEnBD_Form);

// Fin
module.exports = router;
