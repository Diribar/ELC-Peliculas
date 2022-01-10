//************************* Requires *******************************
let express = require("express");
let router = express.Router();
let API = require("./ControladorAPI");
let vista = require("./ControladorVista");

//************************ Middlewares ******************************
let soloUsuarios = require("../../middlewares/usuarios/soloUsuarios");
let autorizadoFA = require("../../middlewares/usuarios/autorizadoFA");
let prodEnBD = require("../../middlewares/varios/productoYaEnBD");
let upload = require("../../middlewares/varios/multer");

//************************ Controladores ****************************
// Controladores de APIs
// Temas de Palabras Clave
router.get("/api/PC-cant-prod", API.cantProductos);
router.get("/api/validar-palabras-clave", API.validarPalabrasClave);
// Temas de Desambiguar
router.get("/api/DS-averiguar-coleccion", API.averiguarColeccion);
// Temas de Tipo de Producto
router.get("/api/TP-averiguar-colecciones", API.averiguarColecciones);
router.get("/api/TP-averiguar-cant-temporadas", API.averiguarCantTemporadas);
router.get("/api/TP-averiguar-capitulos", API.averiguarCapitulos);
// Temas de Copiar FA
router.get("/api/FA-obtener-fa-id", API.obtenerFA_id);
router.get("/api/FA-obtener-elc-id", API.obtenerELC_id);
router.get("/api/validar-copiar-fa", API.validarCopiarFA);
// Temas de Datos Duros
router.get("/api/campos-DD-a-verificar", API.camposDD);
router.get("/api/validar-datos-duros", API.validarDatosDuros);
// Temas de Datos Personalizados
router.get("/api/obtener-RCLV-subcategoria", API.obtenerDatosSubcategoria);
router.get("/api/validar-datos-pers", API.validarDatosPers);

// Controladores de vistas de "Agregar Productos"
router.get("/palabras-clave", soloUsuarios, vista.palabrasClaveForm);
router.post("/palabras-clave", soloUsuarios, vista.palabrasClaveGuardar);
router.get("/desambiguar", soloUsuarios, vista.desambiguarForm);
router.post("/desambiguar", soloUsuarios, vista.desambiguarGuardar);
router.get("/tipo-producto", soloUsuarios, autorizadoFA, vista.tipoProd_Form);
router.post("/tipo-producto-dd", soloUsuarios, vista.tipoProd_Guardar);
router.post("/tipo-producto-fa", soloUsuarios, vista.copiarFA_Form);
router.get("/copiar-fa", soloUsuarios, autorizadoFA, vista.copiarFA_Form);
router.post("/copiar-fa", soloUsuarios, vista.copiarFA_Guardar);
// Comienzo de "prodEnBD"
router.get("/datos-duros", soloUsuarios, prodEnBD, vista.datosDurosForm);
router.post(
	"/datos-duros",
	soloUsuarios,
	prodEnBD,
	upload.single("avatar"),
	vista.datosDurosGuardar
);
router.get("/datos-personalizados", soloUsuarios, prodEnBD, vista.datosPersForm);
router.post("/datos-personalizados", soloUsuarios, prodEnBD, vista.datosPersGuardar);
router.get("/confirma", soloUsuarios, prodEnBD, vista.confirmaForm);
router.post("/confirma", soloUsuarios, prodEnBD, vista.confirmaGuardar);
// Fin de "prodEnBD"
router.get("/terminaste", soloUsuarios, vista.terminasteForm);

// Controladores de vistas auxiliares
router.get("/responsabilidad", soloUsuarios, vista.responsabilidad);
router.get("/ya-en-bd", soloUsuarios, vista.yaEnBD_Form); //router.post("/ya-en-bd", usuarios, vista.yaEnBD_Form);

// Fin
module.exports = router;
