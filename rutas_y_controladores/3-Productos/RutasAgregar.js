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
router.get("/api/contador/", API.contador);
router.get("/api/prod-fa-en-bd/", API.prodFaEnBD);
router.get("/api/procesarcontenidofa/", API.procesarContenidoFA);
router.get("/api/validarDatosDuros/", API.validarDatosDuros);

// Controladores de EJS - 0. Responsabilidad
router.get("/responsabilidad", usuarios, EJS.responsabilidad);
// Controladores de EJS - 1. Palabras Clave
router.get("/palabras_clave", usuarios, EJS.palabrasClaveForm);
router.post("/palabras_clave", usuarios, EJS.palabrasClaveGuardar);
// Controladores de EJS - 2. Desambiguar, Copiar FA, Ya en nuestra BD
router.get("/desambiguar", usuarios, EJS.desambiguarTMDB_Form);
router.post("/desambiguar", usuarios, EJS.desambiguarTMDB_Guardar);
router.get("/copiarfa", usuarios, autorizadoFA, EJS.copiarFA_Form);
router.post("/copiarfa", usuarios, EJS.copiarFA_Guardar);
router.get("/ya-en-bd", usuarios, EJS.yaEnBD_Form);
//router.post("/ya-en-bd", usuarios, EJS.yaEnBD_Form);
// Controladores de EJS - 3. Datos Duros
router.get("/datos_duros", usuarios, prodEnBD, EJS.datosDurosForm);
router.post("/datos_duros", usuarios, upload.single("avatar"), EJS.ddGuardar);

// Controladores de EJS - 4. Datos Personalizados
router.get("/datos_personalizados", usuarios, prodEnBD, EJS.DatosPersForm);
router.post("/datos_personalizados", usuarios, EJS.DatosPersGuardar);

// Fin
module.exports = router;
