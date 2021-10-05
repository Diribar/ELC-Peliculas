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
// Validar campos vs. sintaxis
router.get("/api/palabras-clave/", API.validarPalabrasClave);
router.get("/api/validar-copiar-fa/", API.validarCopiarFA);
router.get("/api/validar-datos-duros/", API.validarDatosDuros);
// Validar campos vs. API/BD
router.get("/api/averiguar-cant-prod/", API.cantProductos);
router.get("/api/averiguar-fa-ya-en-bd/", API.averiguarYaEnBD_FA);

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
