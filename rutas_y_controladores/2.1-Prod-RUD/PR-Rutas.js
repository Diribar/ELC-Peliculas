"use strict";
//************************* Requires *******************************
const express = require("express");
const router = express.Router();
const API = require("./PR-ControlAPI");
const vista = require("./PR-ControlVista");

//************************ Middlewares ******************************
// Específicos de usuarios
const usAltaTerm = require("../../middlewares/filtrosPorUsuario/usAltaTerm");
const usPenalizaciones = require("../../middlewares/filtrosPorUsuario/usPenalizaciones");
const usAptoInput = require("../../middlewares/filtrosPorUsuario/usAptoInput");
// Específicos de productos
const entValida = require("../../middlewares/filtrosPorRegistro/entidadValida");
const IDvalido = require("../../middlewares/filtrosPorRegistro/IDvalido");
const edicion = require("../../middlewares/filtrosPorRegistro/edicion");
const statusCorrecto = require("../../middlewares/filtrosPorRegistro/statusCorrecto");
const rutaCRUD_ID = require("../../middlewares/varios/rutaCRUD_ID");
// Temas de captura
const permUserReg = require("../../middlewares/filtrosPorRegistro/permUserReg");
const capturaActivar = require("../../middlewares/varios/capturaActivar");
const capturaInactivar = require("../../middlewares/varios/capturaInactivar");
// Varios
const multer = require("../../middlewares/varios/multer");

// Consolida
const aptoUsuario = [usAltaTerm, usPenalizaciones, usAptoInput];
const aptoDetalle = [entValida, IDvalido, rutaCRUD_ID];
const aptoCalificar = [...aptoDetalle, statusCorrecto, ...aptoUsuario];
const aptoCRUD = [...aptoCalificar, permUserReg];
const aptoEdicion = [...aptoCRUD, edicion];

//************************ Rutas ****************************
// Rutas de APIs
// Calificaciones
router.get("/api/obtiene-calificaciones", API.califics.delProducto);
router.get("/api/calificacion-guardada", API.califics.delUsuarioProducto);
router.get("/api/elimina-calif-propia", API.califics.elimina);

// Interés en el producto
// router.get("/api/obtiene-opciones-de-interes", API.califics.obtieneOpciones);
// router.get("/api/guarda-interes-del-usuario", API.califics.obtieneOpciones);

// Edición
router.get("/api/valida", API.edicion.valida);
router.get("/api/obtiene-original-y-edicion", API.edicion.obtieneVersionesProd);
router.get("/api/envia-a-req-session", API.edicion.envioParaSession);
router.get("/api/edicion-nueva/eliminar", API.edicion.eliminaNueva);
router.get("/api/edicion-guardada/eliminar", API.edicion.eliminaGuardada);

// Rutas de vistas
router.get("/detalle", aptoDetalle, capturaInactivar, vista.detalle);
router.get("/edicion", aptoEdicion, capturaActivar, vista.edicion.form);
router.post("/edicion", aptoEdicion, multer.single("avatar"), vista.edicion.guardar);
router.get("/calificar", aptoCalificar, vista.califica.form);
router.post("/calificar", aptoCalificar, vista.califica.guardar);

// Fin
module.exports = router;
