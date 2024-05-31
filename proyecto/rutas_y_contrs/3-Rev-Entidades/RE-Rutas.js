"use strict";
// Variables
const router = express.Router();
const API = require("./RE-ControlAPI");
const vista = require("./RE-ControlVista");
const vistaRCLV = require("../2.2-RCLVs/RCLV-ControlVista");

// Middlewares - Específicos de usuarios
const usAltaTerm = require("../../middlewares/filtrosPorUsuario/usAltaTerm");
const usAptoInput = require("../../middlewares/filtrosPorUsuario/usAptoInput");
const usPenalizaciones = require("../../middlewares/filtrosPorUsuario/usPenalizaciones");
const usRolAutTablEnts = require("../../middlewares/filtrosPorUsuario/usRolAutTablEnts");
const usRolRevPERL = require("../../middlewares/filtrosPorUsuario/usRolRevPERL");
const usRolRevLinks = require("../../middlewares/filtrosPorUsuario/usRolRevLinks");

// Middlewares - Específicos del registro
const entValida = require("../../middlewares/filtrosPorRegistro/entidadValida");
const IDvalido = require("../../middlewares/filtrosPorRegistro/IDvalido");
const linkAltaBaja = require("../../middlewares/filtrosPorRegistro/linkAltaBaja");
const rutaCRUD_ID = require("../../middlewares/varios/rutaCRUD_ID");
const statusCorrecto = require("../../middlewares/filtrosPorRegistro/statusCorrecto");
const edicion = require("../../middlewares/filtrosPorRegistro/edicion");
const linksEnSemana = require("../../middlewares/filtrosPorRegistro/linksEnSemana");
const motivoNecesario = require("../../middlewares/filtrosPorRegistro/motivoNecesario");
const motivoOpcional = require("../../middlewares/filtrosPorRegistro/motivoOpcional");

// Middlewares - Temas de captura
const permUserReg = require("../../middlewares/filtrosPorRegistro/permUserReg");
const capturaActivar = require("../../middlewares/varios/capturaActivar");
const capturaInactivar = require("../../middlewares/varios/capturaInactivar");

// Middlewares - Consolidados
const usuarioBase = [usAltaTerm, usPenalizaciones];
const aptoUsuario = [...usuarioBase, usAptoInput];
const aptoCRUD = [entValida, IDvalido, statusCorrecto, ...usuarioBase, permUserReg];
const aptoEdicion = [...aptoCRUD, usRolRevPERL, edicion];

// Middlewares - Otros
const multer = require("../../middlewares/varios/multer");

// APIs - Tablero
router.get("/api/actualiza-visibles", API.actualizaVisibles);

// APIs - Producto y RCLV
router.get("/api/edicion/motivo-generico", API.obtieneMotivoGenerico);
router.get("/api/edicion/aprob-rech", API.edicAprobRech);

// APIs- Links
router.get("/api/link/alta-baja", linkAltaBaja, API.links.altaBaja);
//router.get("/api/link/eliminar", API.links.altaBaja);
router.get("/api/link/edicion", API.edicAprobRech);
router.get("/api/link/siguiente-producto", API.links.sigProd);
router.get("/api/link/obtiene-embeded-link", API.links.obtieneEmbededLink);

// Vistas - Tablero de Control
router.get("/tablero-de-entidades", usuarioBase, usRolAutTablEnts, vista.tableroEntidades);
router.get("/tablero-de-mantenimiento", aptoUsuario, vista.tableroMantenim);

// Vistas - Altas
router.get("/producto/alta", aptoCRUD, rutaCRUD_ID, usRolRevPERL, capturaActivar, vista.altaProdForm);
router.get("/rclv/alta", aptoCRUD, usRolRevPERL, capturaActivar, vistaRCLV.altaEdic.form);

// Vistas - Cambios de status
router.post("/producto/alta", aptoCRUD, usRolRevPERL, capturaInactivar, vista.cambioStatusGuardar);
router.post("/rclv/alta", aptoCRUD, usRolRevPERL, multer.single("avatar"), capturaInactivar, vista.cambioStatusGuardar);
router.post("/:familia/rechazar", aptoCRUD, usRolRevPERL, motivoNecesario, capturaInactivar, vista.cambioStatusGuardar);
router.post("/:familia/inactivar-o-recuperar", aptoCRUD, usRolRevPERL, capturaInactivar, vista.cambioStatusGuardar); // Va sin 'motivo'

// Vistas - Solapamiento
router.get("/rclv/solapamiento", aptoCRUD, usRolRevPERL, capturaActivar, vistaRCLV.altaEdic.form);
router.post("/rclv/solapamiento", aptoCRUD, usRolRevPERL, multer.single("avatar"), capturaInactivar, vista.edic.solapam);

// Vistas - Edición
router.get("/:familia/edicion", aptoEdicion, rutaCRUD_ID, capturaActivar, vista.edic.form);
router.post("/:familia/edicion", aptoEdicion, motivoOpcional, capturaInactivar, vista.edic.avatar);

// Vistas - Links
router.get("/links", aptoCRUD, rutaCRUD_ID, linksEnSemana, usRolRevLinks, capturaActivar, vista.links);

// Fin
module.exports = router;
