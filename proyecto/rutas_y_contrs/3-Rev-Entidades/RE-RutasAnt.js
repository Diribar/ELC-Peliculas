"use strict";
// Variables
const router = express.Router();
const vista = require("./RE-ControlVista");
const vistaRCLV = require("../2.2-RCLVs/RCLV-ControlVista");
const vistaFM = require("../2.0-Familias/FM-ControlVista");

// Vistas - Tablero de Control
router.get("/tablero-de-entidades", usuarioBase, m.usRolAutTablEnts, vista.tableroEntidades);
router.get("/tablero-de-mantenimiento", aptoUsuario, vista.tableroMantenim);

// Vistas - Altas
router.get("/producto/alta", aptoCRUD, m.prodSinRclvAprob, m.capturaActivar, m.rutaCRUD_ID, vista.altaProdForm);
router.post("/producto/alta", aptoCRUD, m.usRolRevPERL, m.prodSinRclvAprob, m.capturaInactivar, vista.cambioStatusGuardar); // Cambios de status
router.get("/rclv/alta", aptoCRUD, m.usRolRevPERL, m.capturaActivar, vistaRCLV.altaEdic.form);
router.post("/rclv/alta", aptoCRUD, m.usRolRevPERL, m.capturaInactivar, m.multer.single("avatar"), vista.cambioStatusGuardar); // Cambios de status

// Vistas - Rechazar
router.get("/:entidad/rechazar", aptoCRUD, m.capturaActivar, vistaFM.form.motivos);
router.post("/:familia/rechazar", aptoCRUD, m.usRolRevPERL, m.capturaInactivar, m.motivoNecesario, vista.cambioStatusGuardar);

// Vistas - Revisar Inactivar
router.get("/:entidad/inactivar", aptoCRUD, m.capturaActivar, vistaFM.form.historial);
router.post("/:familia/inactivar", aptoCRUD, m.usRolRevPERL, m.capturaInactivar, vista.cambioStatusGuardar); // Va sin 'motivo'

// Vistas - Revisar Recuperar
router.get("/:entidad/recuperar", aptoCRUD, m.capturaActivar, vistaFM.form.historial);
router.post("/:familia/recuperar", aptoCRUD, m.usRolRevPERL, m.capturaInactivar, vista.cambioStatusGuardar); // Va sin 'motivo'

// Vistas - Solapamiento
router.get("/rclv/solapamiento", aptoCRUD, m.usRolRevPERL, m.capturaActivar, vistaRCLV.altaEdic.form);
router.post("/rclv/solapamiento", aptoCRUD, m.usRolRevPERL, m.multer.single("avatar"), m.capturaInactivar, vista.edic.solapam);

// Vistas - Edición
router.get("/:familia/edicion", aptoEdicion, m.rutaCRUD_ID, m.capturaActivar, vista.edic.form);
router.post("/:familia/edicion", aptoEdicion, m.motivoOpcional, m.capturaInactivar, vista.edic.avatar);

// Vistas - Links
router.get("/links", aptoCRUD, m.rutaCRUD_ID, m.linksEnSemana, m.usRolRevLinks, m.capturaActivar, vista.links);

const entId = [m.entValida, m.iDvalido];
router.get("/producto/rechazar", entId, vistaFM.redireccionar);
router.get("/rclv/rechazar", entId, vistaFM.redireccionar);
router.get("/producto/inactivar", entId, vistaFM.redireccionar);
router.get("/rclv/inactivar", entId, vistaFM.redireccionar);
router.get("/producto/recuperar", entId, vistaFM.redireccionar);
router.get("/rclv/recuperar", entId, vistaFM.redireccionar);

// Fin
module.exports = router;
