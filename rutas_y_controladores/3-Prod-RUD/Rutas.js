//************************* Requires *******************************
let express = require("express");
let router = express.Router();
let API = require("./ControladorAPI");
let vista = require("./ControladorVista");

//************************ Middlewares ******************************
let soloUsuarios = require("../../middlewares/usuarios/solo-1-usuarios");
let soloAutInput = require("../../middlewares/usuarios/solo-2-aut-input");

//************************ Controladores ****************************
// Controladores de APIs
// Tridente: Detalle, Edición, Links
router.get("/tridente/api/obtener-col-cap", API.obtenerColCap);
router.get("/tridente/api/obtener-cap-ant-y-post", API.obtenerCapAntPostID);
router.get("/tridente/api/obtener-cap-id", API.obtenerCapID);
// Edición
router.get("/edicion/api/validar-edicion", API.validarEdicion);
router.get("/edicion/api/obtener-versiones", API.obtenerVersionesDeProducto);
// Links
router.get("/links/api/validar-links", API.validarLinks);
router.get("/links/api/obtener-provs-links", API.obtenerProvsLinks);

// Controladores de vistas
router.get("/detalle", soloUsuarios, vista.detEdicForm);
router.get("/edicion", soloAutInput, vista.detEdicForm);
router.post("/edicion", soloAutInput, vista.edicAct);
router.get("/edicion/eliminar_edicion", soloAutInput, vista.edicElim);

router.get("/links", soloAutInput, vista.linksForm);
router.get("/revisar", soloAutInput, vista.revisar);
router.get("/calificala", soloAutInput, vista.calificala);
router.get("/eliminar", soloAutInput, vista.eliminar);

// Fin
module.exports = router;
