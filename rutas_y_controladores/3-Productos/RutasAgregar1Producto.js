//************************* Requires *******************************
let express = require("express");
let router = express.Router();
let API = require("./1-Agregar-API");
let vistas = require("./1-Agregar1Productos");

//************************ Middlewares ******************************
let usuarios = require("../../middlewares/usuarios/soloUsuarios");
let autorizadoFA = require("../../middlewares/usuarios/autorizadoFA");

//************************ Controladores ****************************
// Controladores de APIs
// Validar campos vs. sintaxis
router.get("/api/palabras-clave/", API.validarPalabrasClave);
router.get("/api/validar-copiar-fa/", API.validarCopiarFA);
// Validar campos vs. API/BD
router.get("/api/averiguar-cant-prod/", API.cantProductos);
//router.get("/api/averiguar-fa-ya-en-bd/", API.averiguarYaEnBD_FA);

// Controladores de vistas de "Agregar Productos"
router.get("/palabras-clave", usuarios, vistas.palabrasClaveForm);
router.post("/palabras-clave", usuarios, vistas.palabrasClaveGuardar);
router.get("/desambiguar", usuarios, vistas.desambiguarForm);
router.post("/desambiguar", usuarios, vistas.desambiguarGuardar);
router.get("/copiar-fa", usuarios, autorizadoFA, vistas.copiarFA_Form);
router.post("/copiar-fa", usuarios, vistas.copiarFA_Guardar);
router.post("/datosDuros", usuarios, vistas.datosDuros);

// Controladores de vistas auxiliares
router.get("/responsabilidad", usuarios, vistas.responsabilidad);
router.get("/ya-en-bd", usuarios, vistas.yaEnBD_Form);//router.post("/ya-en-bd", usuarios, vistas.yaEnBD_Form);

// Fin
module.exports = router;
