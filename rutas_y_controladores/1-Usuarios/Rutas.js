"use strict";
//************************* Requires *******************************
const express = require("express");
const router = express.Router();
const API = require("./US-ControlAPI");
const vista = require("./US-ControlVista");

//************************ Middlewares ******************************
const soloVisitas = require("../../middlewares/usuarios/solo0-visitas");
const soloUsuarios = require("../../middlewares/usuarios/solo1-usuarios");
const soloUsuariosCompl = require("../../middlewares/usuarios/solo1-usuariosCompl");
const multer = require("../../middlewares/varios/multer");

//************************ Rutas ****************************
// Rutas de APIs
router.get("/api/valida-login", API.validaLogin);
router.get("/api/valida-mail", API.validaMail);
router.get("/api/valida-editables", API.validaEditables);
router.get("/api/valida-documento", API.validaDocumento);

// Rutas de Altas
router.get("/redireccionar", vista.redireccionar);
router.get("/alta-mail", soloVisitas, vista.altaMailForm);
router.post("/alta-mail", soloVisitas, vista.altaMailGuardar);
router.get("/editables", soloUsuarios, vista.editablesForm);
router.post("/editables", soloUsuarios, multer.single("avatar"), vista.editablesGuardar);
router.get("/bienvenido", soloUsuariosCompl, vista.bienvenido);
// router.get("/responsabilidad", soloUsuariosCompl, vista.responsab);
router.get("/validacion-identidad", soloUsuariosCompl, vista.validaForm);
router.post("/validacion-identidad", soloUsuariosCompl, multer.single("avatar"), vista.validaGuardar);
router.get("/validacion-en-proceso", soloUsuariosCompl, vista.validacionEnProceso);

// Rutas RUD
router.get("/edicion", soloUsuariosCompl, vista.edicionForm);
router.put("/edicion", soloUsuariosCompl, multer.single("avatar"), vista.edicionGuardar); //Validar mail y editables

// Login
router.get("/login", soloVisitas, vista.loginForm);
router.post("/login", soloVisitas, vista.loginGuardar);
router.get("/logout", soloUsuarios, vista.logout);
router.get("/olvido-contrasena", soloVisitas, vista.altaMailForm);
router.post("/olvido-contrasena", soloVisitas, vista.olvidoContrGuardar);

module.exports = router;
