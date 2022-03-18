//************************* Requires *******************************
let express = require("express");
let router = express.Router();
let vista = require("./ControladorVista");

//************************ Middlewares ******************************
let soloUsuarios = require("../../middlewares/usuarios/solo1-usuarios");

//************************ Controladores ****************************
// Controladores de Opciones
router.get("/:id", vista.opcion);
router.get("/:id/:id", vista.tipo);
// router.post("/:id/:id", soloUsuarios, vista.filtros);
router.get("/", vista.home);

// Fin
module.exports = router;
