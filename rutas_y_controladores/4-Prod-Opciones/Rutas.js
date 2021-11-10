//************************* Requires *******************************
let express = require("express");
let router = express.Router();
let opciones = require("./3-Opciones");

//************************ Middlewares ******************************
let soloUsuarios = require("../../middlewares/usuarios/soloUsuarios");

//************************ Controladores ****************************
// Controladores de Opciones
router.get("/:id/:id", opciones.tipo);
router.post("/:id/:id", soloUsuarios, opciones.filtros);
router.get("/:id", opciones.opcion);
router.get("/", opciones.home);

// Fin
module.exports = router;
