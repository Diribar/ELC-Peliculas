"use strict";
// Variables
const router = express.Router();
const vista = require("./FM-ControlVista");

// Middlewares - Específicos del registro
const entValida = require("../../middlewares/porRegistro/entidadValida");
const iDvalido = require("../../middlewares/porRegistro/iDvalido");

// Vistas form - Motivos
router.get("/:familia/inactivar", entValida, iDvalido, vista.form.motivos);
router.get("/revision/:familia/rechazar", entValida, iDvalido, vista.form.motivos);

// Vistas form - Historial
router.get("/:familia/recuperar", entValida, iDvalido, vista.form.historial);
router.get("/revision/:familia/inactivar", entValida, iDvalido, vista.form.historial);
router.get("/revision/:familia/recuperar", entValida, iDvalido, vista.form.historial);
router.get("/:familia/historial", entValida, iDvalido, vista.form.historial);

// Vistas -  CRUD: Eliminado
router.get("/:familia/eliminadoPorCreador", entValida, iDvalido, vista.form.elimina);
router.get("/:familia/eliminar", entValida, iDvalido, vista.form.elimina);

// Vistas post
router.post("/:familia/inactivar", entValida, iDvalido, vista.inacRecupGuardar);
router.post("/:familia/recuperar", entValida, iDvalido, vista.inacRecupGuardar);

// Vistas - Correcciones
router.get("/correccion/motivo", entValida, iDvalido, vista.correcs.motivoForm);
router.post("/correccion/motivo", entValida, iDvalido, vista.correcs.motivoGuardar);
router.get("/correccion/status", entValida, iDvalido, vista.correcs.statusForm);
router.post("/correccion/status", entValida, iDvalido, vista.correcs.statusGuardar);

// Fin
module.exports = router;
