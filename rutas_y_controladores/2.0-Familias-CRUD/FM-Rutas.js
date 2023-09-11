"use strict";
//************************* Requires *******************************
const router = express.Router();
const vista = require("./FM-ControlVista");
const API = require("./FM-ControlAPI");

//************************ Middlewares ******************************
// Específicos de usuarios
const usAltaTerm = require("../../middlewares/filtrosPorUsuario/usAltaTerm");
const usPenalizaciones = require("../../middlewares/filtrosPorUsuario/usPenalizaciones");
const usAptoInput = require("../../middlewares/filtrosPorUsuario/usAptoInput");
const usRolRevPERL = require("../../middlewares/filtrosPorUsuario/usRolRevPERL");
// Específicos de productos
const entValida = require("../../middlewares/filtrosPorRegistro/entidadValida");
const IDvalido = require("../../middlewares/filtrosPorRegistro/IDvalido");
const statusCorrecto = require("../../middlewares/filtrosPorRegistro/statusCorrecto");
const motivoNecesario = require("../../middlewares/filtrosPorRegistro/motivoNecesario");
const rutaCRUD_ID = require("../../middlewares/varios/rutaCRUD_ID");
// Temas de captura
const permUserReg = require("../../middlewares/filtrosPorRegistro/permUserReg");
const capturaActivar = require("../../middlewares/varios/capturaActivar");
const capturaInactivar = require("../../middlewares/varios/capturaInactivar");

// Consolida
const aptoUsuario = [usAltaTerm, usPenalizaciones, usAptoInput];
const aptoDetalle = [entValida, IDvalido, rutaCRUD_ID];
const aptoCRUD = [...aptoDetalle, statusCorrecto, ...aptoUsuario, permUserReg];
const aptoEliminar = [...aptoCRUD, usRolRevPERL];

//************************ Rutas ****************************
// Rutas de APIs
// Tridente: Detalle, Edición, Links
router.get("/crud/api/obtiene-col-cap", API.obtieneColCap);
router.get("/crud/api/obtiene-cap-ant-y-post", API.obtieneCapAntPostID);
router.get("/crud/api/obtiene-cap-id", API.obtieneCapID);
router.get("/crud/api/obtiene-capitulos", API.obtieneCapitulos);
router.get("/crud/api/motivos-status", API.motivosRechAltas);
router.get("/crud/api/actualiza-visibles", API.actualizarVisibles);

// CRUD-Inactivar, Recuperar, Eliminar, Eliminado
router.get("/:familia/inactivar", aptoCRUD, capturaActivar, vista.inacRecup.form);
router.get("/:familia/recuperar", aptoCRUD, capturaActivar, vista.inacRecup.form);
router.get("/:familia/eliminar", aptoEliminar, capturaActivar, vista.inacRecup.form);
router.get("/:familia/eliminado", vista.eliminado);

// CRUD-Inactivar, Recuperar, Eliminar
router.post("/:familia/inactivar", aptoCRUD, motivoNecesario, capturaInactivar, vista.inacRecup.guardar);
router.post("/:familia/recuperar", aptoCRUD, capturaInactivar, vista.inacRecup.guardar);
router.post("/:familia/eliminar", aptoEliminar, capturaInactivar, vista.eliminar);

// Revisión
router.get("/:familia/inactivar-o-recuperar", aptoCRUD, capturaActivar, vista.inacRecup.form);
router.get("/:familia/rechazo", aptoCRUD, capturaActivar, vista.inacRecup.form);

// Fin
module.exports = router;
