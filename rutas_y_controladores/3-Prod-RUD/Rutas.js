//************************* Requires *******************************
let express = require("express");
let router = express.Router();
let API = require("./ControladorAPI");
let vista = require("./ControladorVista");

//************************ Middlewares ******************************
let soloAutInput = require("../../middlewares/usuarios/solo-2-aut-input");

//************************ Controladores ****************************
// Controladores de APIs
router.get("/api/averiguar-si-esta-disponible", API.averiguarSiEstaDisponible);
router.get("/api/validar-edicion", API.validarEdicion);

// Controladores de vistas
router.get("/detalle", vista.detalleEdicion);
router.get("/edicion", soloAutInput, vista.detalleEdicion);
router.get("/links", soloAutInput, vista.links);
router.get("/revisar", soloAutInput, vista.revisar);
router.get("/calificala", soloAutInput, vista.calificala);
router.get("/eliminar", soloAutInput, vista.eliminar);

// Fin
module.exports = router;
