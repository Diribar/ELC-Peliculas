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
router.get("/api/validar-links", API.validarLinks);
router.get("/api/obtener-provs-links", API.obtenerProvsLinks);

// Controladores de vistas
router.get("/detalle", vista.prod_DBM);
router.get("/edicion", soloAutInput, vista.prod_DBM);
router.get("/links", soloAutInput, vista.links_DAB);
router.get("/revisar", soloAutInput, vista.revisar);
router.get("/calificala", soloAutInput, vista.calificala);
router.get("/eliminar", soloAutInput, vista.eliminar);

// Fin
module.exports = router;
