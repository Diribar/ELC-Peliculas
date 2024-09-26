"use strict";
// Variables
const router = express.Router();
const vista = require("./FM-ControlVista");

// Middlewares - Específicos del registro
const entValida = require("../../middlewares/porRegistro/entidadValida");
const iDvalido = require("../../middlewares/porRegistro/iDvalido");
const entId = [entValida, iDvalido];

// Vistas form - Motivos
router.get("/producto/inactivar", entId, vista.form.motivos);
router.get("/rclv/inactivar", entId, vista.form.motivos);
router.get("/revision/producto/rechazar", entId, vista.form.motivos);
router.get("/revision/rclv/rechazar", entId, vista.form.motivos);

// Vistas form - Historial
router.get("/producto/recuperar", entId, vista.form.historial);
router.get("/rclv/recuperar", entId, vista.form.historial);
router.get("/revision/producto/inactivar", entId, vista.form.historial);
router.get("/revision/rclv/inactivar", entId, vista.form.historial);
router.get("/revision/producto/recuperar", entId, vista.form.historial);
router.get("/revision/rclv/recuperar", entId, vista.form.historial);
router.get("/producto/historial", entId, vista.form.historial);
router.get("/rclv/historial", entId, vista.form.historial);

// Vistas -  CRUD: Eliminado
router.get("/producto/eliminadoPorCreador", entId, vista.form.elimina);
router.get("/rclv/eliminadoPorCreador", entId, vista.form.elimina);
router.get("/producto/eliminar", entId, vista.form.elimina);
router.get("/rclv/eliminar", entId, vista.form.elimina);

// Vistas - Correcciones
router.get("/correccion/motivo", entId, vista.correcs.motivoForm);
router.get("/correccion/status", entId, vista.correcs.statusForm);

// Fin
module.exports = router;
