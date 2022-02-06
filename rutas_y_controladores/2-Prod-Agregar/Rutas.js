//************************* Requires *******************************
let express = require("express");
let router = express.Router();
let API = require("./ControladorAPI");
let vista = require("./ControladorVista");

//************************ Middlewares ******************************
let soloAutOutput = require("../../middlewares/usuarios/solo-2-aut-output");
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
router.get("/api/validar-datos-duros", API.validarDatosDuros);
// Temas de Datos Personalizados
router.get("/api/obtener-RCLV-subcategoria", API.obtenerDatosSubcategoria);
router.get("/api/validar-datos-pers", API.validarDatosPers);

// Controladores de vistas de "Agregar Productos"
router.get("/palabras-clave", soloAutOutput, vista.palabrasClaveForm);
router.post("/palabras-clave", soloAutOutput, vista.palabrasClaveGuardar);
router.get("/desambiguar", soloAutOutput, vista.desambiguarForm);
router.post("/desambiguar", soloAutOutput, vista.desambiguarGuardar);
router.get("/tipo-producto", soloAutOutput, autorizadoFA, vista.tipoProd_Form);
router.post("/tipo-producto-dd", soloAutOutput, vista.tipoProd_Guardar);
router.post("/tipo-producto-fa", soloAutOutput, vista.copiarFA_Form);
router.get("/copiar-fa", soloAutOutput, autorizadoFA, vista.copiarFA_Form);
router.post("/copiar-fa", soloAutOutput, vista.copiarFA_Guardar);
// Comienzo de "prodEnBD"
router.get("/datos-duros", soloAutOutput, prodEnBD, vista.datosDurosForm);
router.post(
	"/datos-duros",
	soloAutOutput,
	prodEnBD,
	upload.single("avatar"),
	vista.datosDurosGuardar
);
router.get("/datos-personalizados", soloAutOutput, prodEnBD, vista.datosPersForm);
router.post("/datos-personalizados", soloAutOutput, prodEnBD, vista.datosPersGuardar);
router.get("/confirma", soloAutOutput, prodEnBD, vista.confirmaForm);
router.post("/confirma", soloAutOutput, prodEnBD, vista.confirmaGuardar);
// Fin de "prodEnBD"
router.get("/terminaste", soloAutOutput, vista.terminasteForm);

// Controladores de vistas auxiliares
router.get("/responsabilidad", vista.responsabilidad);
router.get("/ya-en-bd", vista.yaEnBD_Form); //router.post("/ya-en-bd", usuarios, vista.yaEnBD_Form);

// Fin
module.exports = router;
