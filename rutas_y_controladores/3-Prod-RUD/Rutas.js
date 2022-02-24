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
router.get("/api/averiguar-si-esta-disponible", API.averiguarSiEstaDisponible);
router.get("/api/validar-edicion", API.validarEdicion);
router.get("/api/validar-links", API.validarLinks);
router.get("/api/obtener-provs-links", API.obtenerProvsLinks);
router.get("/api/obtener-col-cap", API.obtenerColCap);
router.get("/api/obtener-cap-ant-y-post", API.obtenerCapAntPostID);
router.get("/api/obtener-cap-id", API.obtenerCapID);

// Controladores de vistas
router.get("/detalle", soloUsuarios, vista.prodForm);
router.get("/edicion", soloAutInput, vista.prodForm);
router.post("/edicion", soloAutInput, vista.prodActualizar);
router.get("/edicion/eliminar_edicion", soloAutInput, vista.prodEliminarEdicion);

router.get("/links", soloAutInput, vista.linksForm);
router.get("/revisar", soloAutInput, vista.revisar);
router.get("/calificala", soloAutInput, vista.calificala);
router.get("/eliminar", soloAutInput, vista.eliminar);

// Fin
module.exports = router;
