//************************* Requires *******************************
let express = require("express");
let router = express.Router();
let API = require("./ControladorAPI");
let vista = require("./ControladorVista");

//************************ Middlewares ******************************
let soloUsuarios = require("../../middlewares/usuarios/solo-1-usuarios");
let soloAutInput = require("../../middlewares/usuarios/solo-2-aut-input");
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
router.get("/edicion", soloAutInput, vista.detEdicForm); // capturaUsuario, capturaProducto
router.post("/edicion/actualizar", soloAutInput, multer.single("avatar"), vista.edicAct); // capturaUsuario, capturaProducto
router.get("/edicion/eliminar", soloAutInput, vista.edicElim); // capturaUsuario, capturaProducto;

router.get("/links", soloAutInput, vista.linksForm); // capturaUsuario, capturaProducto;
router.post("/links", soloAutInput, vista.linksGuardar); // capturaUsuario, capturaProducto;
router.get("/revisar", soloAutInput, vista.revisar); // capturaUsuario, capturaProducto;
router.get("/eliminar", soloAutInput, vista.eliminar); // capturaUsuario, capturaProducto;
router.get("/calificala", soloAutInput, vista.calificala);

// Fin
module.exports = router;
