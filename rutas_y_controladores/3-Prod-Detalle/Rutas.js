//************************* Requires *******************************
let express = require("express");
let router = express.Router();
let controlador = require("./Controlador");

//************************ Middlewares ******************************
let soloUsuarios = require("../../middlewares/usuarios/soloUsuarios");

//************************ Controladores ****************************
router.get("/informacion", controlador.informacion);
// router.get("/editar/:id", soloUsuarios, controlador.detalle);
// router.get("/eliminar/:id", soloUsuarios, controlador.detalle);
// router.get("/calificala/:id", soloUsuarios, controlador.detalle);
// router.get("/:id/:id", controlador.detalle);

router.post("/editar/:id", soloUsuarios, controlador.editarGuardar);
router.post("/eliminar/:id", soloUsuarios, controlador.bajaGuardar);

// Fin
module.exports = router;
