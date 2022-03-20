//************************* Requires *******************************
const express = require("express");
const router = express.Router();
const API = require("./ControladorAPI");
const vista = require("./ControladorVista");

//************************ Middlewares ******************************
const soloUsuarios = require("../../middlewares/usuarios/solo1-usuarios");
const soloAutInput = require("../../middlewares/usuarios/solo2-aut-input");
const entidadId = require("../../middlewares/entidades/entidadId");
const prodEdicion = require("../../middlewares/entidades/RUD-edicion");
const multer = require("../../middlewares/varios/multer");
let capturaUsuario;
let capturaProducto;

//************************ Controladores ****************************
// Controladores de vistas
router.get("/detalle", soloUsuarios, entidadId, vista.detalleEdicionForm);
router.get("/calificala", soloAutInput, entidadId, vista.calificala);

router.get("/edicion", soloAutInput, entidadId, prodEdicion, vista.detalleEdicionForm);
router.post("/edicion/guardar", soloAutInput, entidadId,prodEdicion, multer.single("avatar"), vista.edicionGuardar);
router.get("/edicion/eliminar", soloAutInput, entidadId, vista.edicionEliminar);
router.get("/links", soloAutInput, entidadId, vista.linksForm);

router.post("/links/altas-editar", soloAutInput, vista.linksAltasEditar);

// Controladores de APIs
// Tridente: Detalle, Edición, Links
router.get("/tridente/api/obtener-col-cap", API.obtenerColCap);
router.get("/tridente/api/obtener-cap-ant-y-post", API.obtenerCapAntPostID);
router.get("/tridente/api/obtener-cap-id", API.obtenerCapID);
// Edición
router.get("/edicion/api/validar-edicion", API.validarEdicion);
router.get("/edicion/api/obtener-original-y-edicion", API.obtenerVersionesDelProducto);
router.get("/edicion/api/enviar-a-req-session", API.enviarAReqSession);
router.get("/edicion/api/obtener-de-req-session", API.obtenerDeReqSession);
// Links
router.get("/links/api/validar-links", API.linksValidar);
router.get("/links/api/obtener-provs-links", API.linksObtenerProvs);
router.get("/links/eliminar", API.linksEliminar);

// Fin
module.exports = router;
