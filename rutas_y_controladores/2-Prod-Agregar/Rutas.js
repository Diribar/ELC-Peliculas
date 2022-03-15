//************************* Requires *******************************
let express = require("express");
let router = express.Router();
let API = require("./ControladorAPI");
let vista = require("./ControladorVista");

//************************ Middlewares ******************************
let soloAutInput = require("../../middlewares/usuarios/solo-2-aut-input");
let autorizadoFA = require("../../middlewares/usuarios/autorizadoFA");
let prodEnBD = require("../../middlewares/varios/productoYaEnBD");
let multer = require("../../middlewares/varios/multer");

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
router.get("/api/TP-averiguar-capitulos", API.obtenerCapitulos);
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
router.get("/palabras-clave", soloAutInput, vista.palabrasClaveForm);
router.post("/palabras-clave", soloAutInput, vista.palabrasClaveGuardar);
router.get("/desambiguar", soloAutInput, vista.desambiguarForm);
router.post("/desambiguar", soloAutInput, vista.desambiguarGuardar);
router.get("/tipo-producto", soloAutInput, autorizadoFA, vista.tipoProd_Form);
router.post("/tipo-producto-dd", soloAutInput, vista.tipoProd_Guardar);
router.post("/tipo-producto-fa", soloAutInput, vista.copiarFA_Form);
router.get("/copiar-fa", soloAutInput, autorizadoFA, vista.copiarFA_Form);
router.post("/copiar-fa", soloAutInput, vista.copiarFA_Guardar);
// Comienzo de "prodEnBD"
router.get("/datos-duros", soloAutInput, prodEnBD, vista.datosDurosForm);
router.post("/datos-duros", soloAutInput, prodEnBD, multer.single("avatar"), vista.datosDurosGuardar);
router.get("/datos-personalizados", soloAutInput, prodEnBD, vista.datosPersForm);
router.post("/datos-personalizados", soloAutInput, prodEnBD, vista.datosPersGuardar);
router.get("/confirma", soloAutInput, prodEnBD, vista.confirmaForm);
router.post("/confirma", soloAutInput, prodEnBD, vista.confirmaGuardar);
// Fin de "prodEnBD"
router.get("/terminaste", soloAutInput, vista.terminasteForm);

// Controladores de vistas auxiliares
router.get("/responsabilidad", vista.responsabilidad);
router.get("/ya-en-bd", vista.yaEnBD_Form); //router.post("/ya-en-bd", usuarios, vista.yaEnBD_Form);

// Fin
module.exports = router;
