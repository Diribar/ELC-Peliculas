"use strict";
// Variables
const router = express.Router();
const API = require("./PR-ControlAPI");
const vista = require("./PR-ControlVista");

// Middlewares - Específicos de usuarios
const usAltaTerm = require("../../middlewares/porUsuario/usAltaTerm");
const usPenalizaciones = require("../../middlewares/porUsuario/usPenalizaciones");
const usAptoInput = require("../../middlewares/porUsuario/usAptoInput");

// Middlewares - Específicos del registro
const entValida = require("../../middlewares/porRegistro/entidadValida");
const iDvalido = require("../../middlewares/porRegistro/iDvalido");
const rutaCRUD_ID = require("../../middlewares/varios/rutaCRUD_ID");
const misDetalleProd = require("../../middlewares/varios/misDetalleProd");
const edicion = require("../../middlewares/porRegistro/edicionVista");
const statusCorrecto = require("../../middlewares/porRegistro/statusCorrecto");

// Middlewares - Temas de captura
const permUserReg = require("../../middlewares/porRegistro/permUserReg");
const capturaActivar = require("../../middlewares/varios/capturaActivar");
const capturaInactivar = require("../../middlewares/varios/capturaInactivar");

// Middlewares - Otros
const multer = require("../../middlewares/varios/multer");

// Middlewares - Consolidados
const aptoDetalle = [entValida, iDvalido, rutaCRUD_ID];
const aptoUsuario = [usAltaTerm, usPenalizaciones, usAptoInput];
const aptoCalificar = [...aptoDetalle, statusCorrecto, ...aptoUsuario];
const aptoEdicion = [...aptoCalificar, permUserReg, edicion];

// API - Calificaciones
router.get("/api/obtiene-las-calificaciones", API.califics.delProducto);
router.get("/api/obtiene-la-calificacion-del-usuario", API.califics.delUsuarioProducto);
router.get("/api/elimina-la-calificacion-propia", API.califics.elimina);

// API - Preferencias por producto
router.get("/api/obtiene-opciones-de-preferencia", API.prefsDeCampo.obtieneOpciones);
router.get("/api/guarda-la-preferencia-del-usuario", API.prefsDeCampo.guardaLaPreferencia);

// API - Edición
router.get("/api/valida", API.edicion.valida);
router.get("/api/obtiene-original-y-edicion", API.edicion.obtieneVersionesProd);
router.get("/api/edicion/obtiene-variables-prod", API.edicion.variables);
router.get("/api/envia-a-req-session", API.edicion.envioParaSession);
router.get("/api/edicion/eliminar-nueva", API.edicion.eliminaNueva);
router.get("/api/edicion/eliminar-guardada", API.edicion.eliminaGuardada);

// Vistas
router.get("/dp", aptoDetalle, misDetalleProd, capturaInactivar, vista.detalle);
router.get("/ep", aptoEdicion, capturaActivar, vista.edicion.form);
router.post("/ep", aptoEdicion, multer.single("avatar"), vista.edicion.guardar);
router.get("/calificar", aptoCalificar, vista.califica.form);
router.post("/calificar", aptoCalificar, vista.califica.guardar);

// Fin
module.exports = router;
