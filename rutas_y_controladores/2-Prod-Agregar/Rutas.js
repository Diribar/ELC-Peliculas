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
router.get("/api/palabras-clave", API.validarPalabrasClave);
router.get("/api/validar-copiar-fa", API.validarCopiarFA);
router.get("/api/averiguar-coleccion", API.averiguarColeccion);
router.get("/api/validar-datos-duros", API.validarDatosDuros);
router.get("/api/validar-datos-pers", API.validarDatosPers);
router.get("/api/obtener-fa-id", API.obtenerFA_id);
router.get("/api/obtener-elc-id", API.obtenerELC_id);

// Temas generales de APIs
router.get("/api/PC-cant-prod", API.cantProductos);
router.get("/api/DD-paises", API.obtenerPaises);

// Controladores de vistas de "Agregar Productos"
router.get("/palabras-clave", usuarios, vista.palabrasClaveForm);
router.post("/palabras-clave", usuarios, vista.palabrasClaveGuardar);
router.get("/desambiguar", usuarios, vista.desambiguarForm);
router.post("/desambiguar", usuarios, vista.desambiguarGuardar);
router.get("/tipo-producto", usuarios, autorizadoFA, vista.tipoProducto_Form);
router.post("/tipo-producto-dd", usuarios, vista.tipoProducto_Guardar);
router.post("/tipo-producto-fa", usuarios, vista.tipoProducto_Guardar);
router.get("/copiar-fa", usuarios, autorizadoFA, vista.copiarFA_Form);
router.post("/copiar-fa", usuarios, vista.copiarFA_Guardar);
// Comienzo de "prodEnBD"
router.get("/datos-duros", usuarios, prodEnBD, vista.datosDurosForm);
router.post("/datos-duros", usuarios, prodEnBD, upload.single("avatar"), vista.datosDurosGuardar);
router.get("/datos-personalizados", usuarios, prodEnBD, vista.datosPersForm);
router.post("/datos-personalizados", usuarios, prodEnBD, vista.datosPersGuardar);
router.get("/confirma", usuarios, prodEnBD, vista.confirmaForm);
router.post("/confirma", usuarios, prodEnBD, vista.confirmaGuardar);
// Fin de "prodEnBD"
router.get("/terminaste", usuarios, vista.terminasteForm);

// Controladores de vistas auxiliares
router.get("/responsabilidad", usuarios, vista.responsabilidad);
router.get("/ya-en-bd", usuarios, vista.yaEnBD_Form); //router.post("/ya-en-bd", usuarios, vista.yaEnBD_Form);

// Fin
module.exports = router;
