//************************* Requires *******************************
let express = require("express");
let router = express.Router();
let API = require("./1-Agregar-API");
let EJS = require("./1-Agregar-EJS");

//************************ Middlewares ******************************
let usuarios = require("../../middlewares/usuarios/soloUsuarios");
let autorizadoFA = require("../../middlewares/usuarios/autorizadoFA");
let prodEnBD = require("../../middlewares/varios/productoYaEnBD");

//********************* Otros Middlewares ***************************
let upload = require("../../middlewares/varios/multer");

//************************ Controladores ****************************
// Controladores de APIs
router.get("/api/palabras-clave/", API.palabrasClave);
router.get("/api/cant-prod/", API.cantProductos);
router.get("/api/obtener-fa-id/", API.obtenerFA_id);
router.get("/api/obtener-elc-id/", API.obtenerELC_id);
router.get("/api/imagen-fa/", API.validarImagenFA);
router.get("/api/procesar-contenido-fa/", API.procesarContenidoFA);
router.get("/api/validar-datos-duros/", API.validarDatosDuros);

// Controladores de EJS
router.get("/responsabilidad", usuarios, EJS.responsabilidad);
router.get("/palabras-clave", usuarios, EJS.palabrasClaveForm);
router.post("/palabras-clave", usuarios, EJS.palabrasClaveGuardar);
router.get("/desambiguar", usuarios, EJS.desambiguarTMDB_Form);
router.post("/desambiguar", usuarios, EJS.desambiguarTMDB_Guardar);
router.get("/copiar-fa", usuarios, autorizadoFA, EJS.copiarFA_Form);
router.post("/copiar-fa", usuarios, EJS.copiarFA_Guardar);
router.get("/ya-en-bd", usuarios, EJS.yaEnBD_Form);//router.post("/ya-en-bd", usuarios, EJS.yaEnBD_Form);
router.get("/datos-duros", usuarios, prodEnBD, EJS.datosDurosForm);
router.post("/datos-duros", usuarios, upload.single("avatar"), EJS.ddGuardar);
router.get("/datos-personalizados", usuarios, prodEnBD, EJS.DatosPersForm);
router.post("/datos-personalizados", usuarios, EJS.DatosPersGuardar);

// Fin
module.exports = router;
