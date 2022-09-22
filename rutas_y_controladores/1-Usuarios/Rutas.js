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
router.get("/api/validar-documento", API.validarDocumento);

// Rutas de Altas
router.get("/redireccionar", vista.redireccionar);
router.get("/alta-mail", soloVisitas, vista.altaMailForm);
router.post("/alta-mail", soloVisitas, vista.altaMailGuardar);
router.get("/datos-editables", soloUsuarios, vista.editablesForm);
router.post("/datos-editables", soloUsuarios, multer.single("avatar"), vista.editablesGuardar);
router.get("/bienvenido", soloUsuarios, vista.bienvenido);
// router.get("/responsabilidad", soloUsuarios, vista.responsab);
router.get("/documento", soloUsuarios, vista.documentoForm);
router.post("/documento", soloUsuarios, multer.single("docum_avatar"), vista.documentoGuardar);
router.get("/documento-recibido", vista.documentoRecibido);

// Rutas RUD
router.get("/edicion", soloUsuarios, vista.edicionForm);
router.put("/edicion", soloUsuarios, multer.single("avatar"), vista.edicionGuardar); //Validar mail y editables

// Login
router.get("/login", soloVisitas, vista.loginForm);
router.post("/login", soloVisitas, vista.loginGuardar);
router.get("/pre-logout", soloUsuarios, vista.preLogout);
router.get("/logout", soloUsuarios, vista.logout);
router.get("/olvido-contrasena", soloVisitas, vista.altaMailForm);
router.post("/olvido-contrasena", soloVisitas, vista.olvidoContrGuardar);

module.exports = router;
