"use strict";
// Variables
const router = express.Router();
const vista = require("./FM-ControlVista");

// Vistas form - Motivos
router.get("/:familia/inactivar", vista.form.motivos);
router.get("/revision/:familia/rechazar", vista.form.motivos);

// Vistas form - Historial
router.get("/:familia/recuperar", vista.form.historial);
router.get("/revision/:familia/inactivar", vista.form.historial);
router.get("/revision/:familia/recuperar", vista.form.historial);
router.get("/:familia/historial", vista.form.historial);

// Vistas -  CRUD: Eliminado
router.get("/:familia/eliminadoPorCreador", vista.form.elimina);
router.get("/:familia/eliminar", vista.form.elimina);

// Vistas post
router.post("/:familia/inactivar", vista.inacRecupGuardar);
router.post("/:familia/recuperar", vista.inacRecupGuardar);

// Vistas - Correcciones
router.get("/correccion/motivo", vista.correcs.motivoForm);
router.post("/correccion/motivo", vista.correcs.motivoGuardar);
router.get("/correccion/status", vista.correcs.statusForm);
router.post("/correccion/status", vista.correcs.statusGuardar);

// Fin
module.exports = router;
