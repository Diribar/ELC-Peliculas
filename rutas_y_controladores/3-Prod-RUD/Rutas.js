//************************* Requires *******************************
let express = require("express");
let router = express.Router();
let API = require("./ControladorAPI");
let vista = require("./ControladorVista");

//************************ Middlewares ******************************
let soloAutOutput = require("../../middlewares/usuarios/solo-2-aut-output");

//************************ Controladores ****************************
// Controladores de APIs
router.get("/api/averiguar-si-esta-disponible", API.averiguarSiEstaDisponible);

// Controladores de vistas
router.get("/detalle", vista.detalle);
router.get("/editar", soloAutOutput, vista.detalle);
router.get("/calificala", soloAutOutput, vista.calificala);
router.get("/eliminar", soloAutOutput, vista.eliminar);

// Fin
module.exports = router;
