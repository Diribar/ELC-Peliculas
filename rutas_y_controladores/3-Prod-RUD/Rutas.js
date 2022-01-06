//************************* Requires *******************************
let express = require("express");
let router = express.Router();
let API = require("./ControladorAPI");
let vista = require("./ControladorVista");

//************************ Middlewares ******************************
let soloUsuarios = require("../../middlewares/usuarios/soloUsuarios");

//************************ Controladores ****************************
// Controladores de APIs
router.get("/api/averiguar-si-esta-disponible", API.averiguarSiEstaDisponible);


// Controladores de vistas
router.get("/detalle", vista.detalle);
router.get("/editar", soloUsuarios, vista.editar);
router.get("/calificala", soloUsuarios, vista.calificala);
router.get("/eliminar", soloUsuarios, vista.eliminar);

// Fin
module.exports = router;
