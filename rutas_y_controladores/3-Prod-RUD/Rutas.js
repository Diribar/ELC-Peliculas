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
router.get("/links/api/validar-links", API.validarLinks);
router.get("/links/api/obtener-provs-links", API.obtenerProvsLinks);

// Controladores de vistas
router.get("/detalle", vista.detEdicForm);
router.get("/calificala", soloAutInput, vista.calificala);

router.get("/edicion", soloAutInput, vista.detEdicForm);
router.post("/edicion/actualizar", soloAutInput, multer.single("avatar"), vista.edicAct);
router.get("/edicion/eliminar", soloAutInput, vista.edicElim);
router.get("/links", soloAutInput, vista.linksForm);
router.post("/links", soloAutInput, vista.linksGuardar);

router.get("/revisión", soloGestionProd, vista.revisar);


// Fin
module.exports = router;
