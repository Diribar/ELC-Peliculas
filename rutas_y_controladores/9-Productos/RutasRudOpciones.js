//************************* Requires *******************************
let express = require("express");
let router = express.Router();
let RUD = require("./2-RUD");
let opciones = require("./3-Opciones");

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

// Controladores de Opciones
router.get("/:id/:id", opciones.tipo);
router.post("/:id/:id", soloUsuarios, opciones.filtros);
router.get("/:id", opciones.opcion);
router.get("/", opciones.home);

// Fin
module.exports = router;
