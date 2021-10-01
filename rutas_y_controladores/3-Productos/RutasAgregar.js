//************************* Requires *******************************
let express = require("express");
let router = express.Router();
let API = require("./1-Agregar-API");
let vistas = require("./1-Agregar-Vistas");

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

// Controladores de vistas
router.get("/responsabilidad", usuarios, vistas.responsabilidad);
router.get("/palabras-clave", usuarios, vistas.palabrasClaveForm);
router.post("/palabras-clave", usuarios, vistas.palabrasClaveGuardar);
router.get("/desambiguar", usuarios, vistas.desambiguarTMDB_Form);
router.post("/desambiguar", usuarios, vistas.desambiguarTMDB_Guardar);
router.get("/copiar-fa", usuarios, autorizadoFA, vistas.copiarFA_Form);
router.post("/copiar-fa", usuarios, vistas.copiarFA_Guardar);
router.get("/ya-en-bd", usuarios, vistas.yaEnBD_Form);//router.post("/ya-en-bd", usuarios, vistas.yaEnBD_Form);
router.get("/datos-duros", usuarios, prodEnBD, vistas.datosDurosForm);
router.post("/datos-duros", usuarios, upload.single("avatar"), vistas.ddGuardar);
router.get("/datos-personalizados", usuarios, prodEnBD, vistas.DatosPersForm);
router.post("/datos-personalizados", usuarios, vistas.DatosPersGuardar);

// Fin
module.exports = router;
