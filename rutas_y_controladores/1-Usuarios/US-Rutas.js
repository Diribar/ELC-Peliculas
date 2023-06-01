"use strict";
//************************* Requires *******************************
const express = require("express");
const router = express.Router();
const API = require("./US-ControlAPI");
const vista = require("./US-ControlVista");

//************************ Middlewares ******************************
const visitas = require("../../middlewares/filtrosPorUsuario/visitas");
const statusCorrecto = require("../../middlewares/filtrosPorUsuario/usStatusCorrecto");
const usAltaTerm = require("../../middlewares/filtrosPorUsuario/usAltaTerm");
const usPenalizaciones = require("../../middlewares/filtrosPorUsuario/usPenalizaciones");
const multer = require("../../middlewares/varios/multer");

//************************ Rutas ****************************
// Rutas de APIs
router.get("/api/valida-login", API.validaLogin);
router.get("/api/valida-mail", API.validaMail);
router.get("/api/valida-editables", API.validaEditables);
router.get("/api/valida-identidad", API.validaIdentidad);

// Rutas de Altas
// 1. Sólo visitas
router.get("/garantiza-login-y-completo", vista.login_y_completo);
router.get("/alta-mail", visitas, vista.altaMailForm);
router.post("/alta-mail", visitas, vista.altaMailGuardar);
// 2. Solo usuarios con status 'mail_validado'
router.get("/editables", statusCorrecto, vista.editablesForm);
router.post("/editables", statusCorrecto, multer.single("avatar"), vista.editablesGuardar);
// 3. Solo usuarios con status 'editables'
router.get("/bienvenido", statusCorrecto, vista.bienvenido);
// 4. Solo usuarios con status 'editables' y no penalizadas
router.get("/identidad", statusCorrecto, usPenalizaciones, vista.identidadForm);
router.post("identidad", statusCorrecto, usPenalizaciones, multer.single("avatar"), vista.identidadGuardar);
// 5. Solo usuarios con status 'ident_a_validar'
router.get("/validacion-en-proceso", statusCorrecto, vista.validacionEnProceso);

// Rutas RUD
router.get("/edicion", usAltaTerm, vista.edicionForm);
router.put("/edicion", usAltaTerm, multer.single("avatar"), vista.edicionGuardar); //Validar mail y editables

// Login
router.get("/login", visitas, vista.loginForm);
router.post("/login", visitas, vista.loginGuardar);
router.get("/olvido-contrasena", visitas, vista.altaMailForm);
router.post("/olvido-contrasena", visitas, vista.olvidoContrGuardar);
router.get("/logout", statusCorrecto, vista.logout);

module.exports = router;
