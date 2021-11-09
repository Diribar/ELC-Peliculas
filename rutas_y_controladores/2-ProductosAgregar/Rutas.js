//************************* Requires *******************************
let express = require("express");
let router = express.Router();
let API = require("./ControladorAPI");
let vista = require("./ControladorVista");

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
router.get("/datos-duros", usuarios, vista.datosDurosForm);
router.post("/datos-duros", usuarios, prodEnBD, upload.single("avatar"), vista.DDG);
router.get("/datos-personalizados", usuarios, vista.datosPersForm);
router.post("/datos-personalizados", usuarios, prodEnBD, vista.datosPersGuardar);
router.get("/confirmar", usuarios, vista.confirmarForm);
router.post("/confirmar", usuarios, prodEnBD, vista.confirmarGuardar);
router.get("/conclusion", usuarios, vista.conclusionForm);
router.post("/conclusion", usuarios, vista.conclusionGuardar);

// Controladores de vistas auxiliares
router.get("/responsabilidad", usuarios, vista.responsabilidad);
router.get("/ya-en-bd", usuarios, vista.yaEnBD_Form); //router.post("/ya-en-bd", usuarios, vista.yaEnBD_Form);

// Fin
module.exports = router;
