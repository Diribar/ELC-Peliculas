//************************* Requires *******************************
let express = require("express");
let router = express.Router();
let RUD = require("./2-RUD");

//************************ Middlewares ******************************
let soloUsuarios = require("../../middlewares/usuarios/soloUsuarios");

//************************ Controladores ****************************
// Controladores RUD (método GET)
router.get("/detalle/informacion/:id", soloUsuarios, RUD.detalle);
router.get("/detalle/editar/:id", soloUsuarios, RUD.detalle);
router.get("/detalle/eliminar/:id", soloUsuarios, RUD.detalle);
router.get("/detalle/calificala/:id", soloUsuarios, RUD.detalle);
router.get("/detalle/:id/:id", RUD.detalle);

// Controladores UD (método POST)
router.post("/detalle/editar/:id", soloUsuarios, RUD.editarGuardar);
router.post("/detalle/eliminar/:id", soloUsuarios, RUD.bajaGuardar);

// Fin
module.exports = router;
