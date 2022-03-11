//************************* Requires *******************************
let express = require("express");
let router = express.Router();
let API = require("./ControladorAPI");
let vista = require("./ControladorVista");

//************************ Middlewares ******************************
let soloUsuarios = require("../../middlewares/usuarios/solo-1-usuarios");
let soloAutInput = require("../../middlewares/usuarios/solo-2-aut-input");
let soloGestionProd = require("../../middlewares/usuarios/solo-3-gestion-prod");
let multer = require("../../middlewares/varios/multer");
let capturaUsuario;
let capturaProducto;

//************************ Controladores ****************************
// Controladores de APIs
// Tridente: Detalle, Edición, Links
router.get("/tridente/api/obtener-col-cap", API.obtenerColCap);
router.get("/tridente/api/obtener-cap-ant-y-post", API.obtenerCapAntPostID);
router.get("/tridente/api/obtener-cap-id", API.obtenerCapID);
// Edición
router.get("/edicion/api/validar-edicion", API.validarEdicion);
router.get("/edicion/api/obtener-original-y-edicion", API.obtenerVersionesDelProducto);
router.get("/edicion/api/enviar-a-req-session", API.enviarAReqSession);
router.get("/edicion/api/obtener-de-req-session", API.obtenerDeReqSession);
// Links
router.get("/links/api/validar-links", API.linksValidar);
router.get("/links/api/obtener-provs-links", API.linksObtenerProvs);
router.get("/links/eliminar", API.linksEliminar);

// Controladores de vistas
router.get("/detalle", vista.detalleEdicionForm);
router.get("/calificala", soloAutInput, vista.calificala);

router.get("/edicion", soloAutInput, vista.detalleEdicionForm);
router.post("/edicion/guardar", soloAutInput, multer.single("avatar"), vista.edicionGuardar);
router.get("/edicion/eliminar", soloAutInput, vista.edicionEliminar);
router.get("/links", soloAutInput, vista.linksForm);
router.post("/links/altas-editar", soloAutInput, vista.linksAltasEditar);

router.get("/revisión", soloGestionProd, vista.revisar);


// Fin
module.exports = router;
