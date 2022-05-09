"use strict";
//************************* Requires *******************************
const express = require("express");
const router = express.Router();
const API = require("./ControladorAPI");
const vista = require("./ControladorVista");

//************************ Middlewares ******************************
const soloVisitas = require("../../middlewares/usuarios/solo0-visitas");
const soloUsuarios = require("../../middlewares/usuarios/solo1-usuarios");
const multer = require("../../middlewares/varios/multer");

//************************ Rutas ****************************
// Rutas de APIs
router.get("/api/validar-login", API.validarLogin);
router.get("/api/validar-mail", API.validarMail);
router.get("/api/validar-perennes", API.validarPerennes);
router.get("/api/validar-editables", API.validarEditables);

// Login
router.get("/login", soloVisitas, vista.loginForm);
router.post("/login", soloVisitas, vista.loginGuardar);
router.get("/pre-logout", soloVisitas, vista.logout);
router.get("/logout", soloUsuarios, vista.logout);

// Rutas de Altas
router.get("/mail", soloVisitas, vista.altaMailForm);
router.post("/mail", soloVisitas, vista.altaMailGuardar);
router.get("/altaredireccionar", soloUsuarios, vista.altaRedireccionar);
router.get("/datos-perennes", soloUsuarios, vista.altaPerennesForm);
router.post("/datos-perennes", soloUsuarios, vista.altaPerennesGuardar);
router.get("/datos-editables", soloUsuarios, vista.altaEditablesForm);
router.post("/datos-editables", soloUsuarios, multer.single("avatar"), vista.altaEditablesGuardar);
// router.get("/alta-terminada", soloUsuarios, vista.terminado);
router.get("/autorizado-input/solicitud", soloUsuarios, vista.autInput_solicitudForm);
// router.post("/autorizado-input/solicitud", soloUsuarios, vista.autInput_solicitudGuardar);
// router.get("/autorizado-input/revision", soloUsuarios, vista.autInput_revisionForm);
// router.get("/autorizado-productos/solicitud", soloUsuarios, vista.productos_solicitudForm);
// router.post("/autorizado-productos/solicitud", soloUsuarios, vista.productos_solicitudGuardar);
// router.get("/autorizado-productos/revision", soloUsuarios, vista.productos_revisionForm);
// router.get("/autorizado-usuarios/solicitud", soloUsuarios, vista.usuarios_solicitudForm);
// router.post("/autorizado-usuarios/solicitud", soloUsuarios, vista.usuarios_solicitudGuardar);
// router.get("/autorizado-usuarios/revision", soloUsuarios, vista.usuarios_revisionForm);

// Rutas RUD
router.get("/detalle", soloUsuarios, vista.detalle);
router.get("/edicion", soloUsuarios, vista.editarForm);
router.put("/edicion", soloUsuarios, multer.single("avatar"), vista.editarGuardar); //Validar mail y editables
router.delete("/eliminar", soloUsuarios, vista.baja);

module.exports = router;
