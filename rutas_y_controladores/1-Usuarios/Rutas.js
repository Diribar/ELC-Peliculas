"use strict";
//************************* Requires *******************************
const express = require("express");
const router = express.Router();
const API = require("./US-ControlAPI");
const vista = require("./US-ControlVista");

//************************ Middlewares ******************************
const soloVisitas = require("../../middlewares/usuarios/filtro-0soloVisitas");
const soloUsuarios = require("../../middlewares/usuarios/filtro-1soloUsuarios");
const soloUsuariosTerm = require("../../middlewares/usuarios/filtro-2soloUsuariosTerm");
const multer = require("../../middlewares/varios/multer");

//************************ Rutas ****************************
// Rutas de APIs
router.get("/api/valida-login", API.validaLogin);
router.get("/api/valida-mail", API.validaMail);
router.get("/api/valida-editables", API.validaEditables);
router.get("/api/valida-identidad", API.validaIdentidad);

// Rutas de Altas
router.get("/redireccionar", vista.redireccionar);
router.get("/alta-mail", soloVisitas, vista.altaMailForm);
router.post("/alta-mail", soloVisitas, vista.altaMailGuardar);
router.get("/editables", soloUsuarios, vista.editablesForm);
router.post("/editables", soloUsuarios, multer.single("avatar"), vista.editablesGuardar);
// Sólo para usuarios completos
router.get("/bienvenido", soloUsuariosTerm, vista.bienvenido);
router.get("/valida-identidad", soloUsuariosTerm, vista.validaForm);
router.post("/valida-identidad", soloUsuariosTerm, multer.single("avatar"), vista.validaGuardar);
router.get("/validacion-en-proceso", soloUsuariosTerm, vista.validacionEnProceso);

// Rutas RUD
router.get("/edicion", soloUsuariosTerm, vista.edicionForm);
router.put("/edicion", soloUsuariosTerm, multer.single("avatar"), vista.edicionGuardar); //Validar mail y editables

// Login
router.get("/login", soloVisitas, vista.loginForm);
router.post("/login", soloVisitas, vista.loginGuardar);
router.get("/logout", soloUsuarios, vista.logout);
router.get("/olvido-contrasena", soloVisitas, vista.altaMailForm);
router.post("/olvido-contrasena", soloVisitas, vista.olvidoContrGuardar);

module.exports = router;
