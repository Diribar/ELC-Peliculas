//************************* Requires *******************************
let express = require("express");
let router = express.Router();
let controlador = require("./Controlador");

//************************ Middlewares ******************************
let soloUsuarios = require("../../middlewares/usuarios/soloUsuarios");

//************************ Controladores ****************************
router.get("/detalle", controlador.detalle);
router.get("/editar", soloUsuarios, controlador.editar);
router.get("/calificala", soloUsuarios, controlador.calificala);
router.get("/eliminar", soloUsuarios, controlador.eliminar);

// Fin
module.exports = router;
