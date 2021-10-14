//************************* Requires *******************************
let express = require("express");
let router = express.Router();
let API = require("./ControllerAPI");
let agregar = require("./ControllerProductos");

//************************ Middlewares ******************************
let usuarios = require("../../middlewares/usuarios/soloUsuarios");
let autorizadoFA = require("../../middlewares/usuarios/autorizadoFA");

//************************ Controladores ****************************
// Controladores de APIs
// Validar campos vs. sintaxis
router.get("/api/palabras-clave/", API.validarPalabrasClave);
// Validar campos vs. API/BD
router.get("/api/averiguar-cant-prod/", API.cantProductos);
//router.get("/api/averiguar-fa-ya-en-bd/", API.averiguarYaEnBD_FA);

// Controladores de vistas de "Agregar Productos"
router.get("/palabras-clave", usuarios, agregar.palabrasClaveForm);
router.post("/palabras-clave", usuarios, agregar.palabrasClaveGuardar);
router.get("/desambiguar", usuarios, agregar.desambiguarForm);
router.post("/desambiguar", usuarios, agregar.desambiguarGuardar);
router.get("/copiar-fa", usuarios, autorizadoFA, agregar.copiarFA_Form);
router.post("/copiar-fa", usuarios, agregar.copiarFA_Guardar);
router.post("/datosDuros", usuarios, agregar.datosDuros);

// Controladores de vistas auxiliares
router.get("/responsabilidad", usuarios, agregar.responsabilidad);
router.get("/ya-en-bd", usuarios, agregar.yaEnBD_Form);//router.post("/ya-en-bd", usuarios, agregar.yaEnBD_Form);

// Fin
module.exports = router;
