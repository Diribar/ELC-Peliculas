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
router.get("/api/valida-login", API.validaLogin);
router.get("/api/valida-mail", API.validaMail);
router.get("/api/valida-perennes", API.validaPerennes);
router.get("/api/valida-editables", API.validaEditables);
router.get("/api/valida-documento", API.validaDocumento);

// Rutas de Altas
router.get("/redireccionar", vista.redireccionar);
router.get("/alta-mail", soloVisitas, vista.altaMailForm);
router.post("/alta-mail", soloVisitas, vista.altaMailGuardar);
router.get("/editables", soloUsuarios, vista.editablesForm);
router.post("/editables", soloUsuarios, multer.single("avatar"), vista.editablesGuardar);
router.get("/bienvenido", soloUsuarios, vista.bienvenido);
// router.get("/responsabilidad", soloUsuarios, vista.responsab);
router.get("/documento", soloUsuarios, vista.documentoForm);
router.post("/documento", soloUsuarios, multer.single("avatar"), vista.documentoGuardar);
router.get("/documento-recibido", soloUsuarios, vista.documentoRecibido);

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
