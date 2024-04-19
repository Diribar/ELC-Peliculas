"use strict";
// Variables
const router = express.Router();
const API = require("./US-ControlAPI");
const vista = require("./US-ControlVista");

// Middlewares - Particulares
const visitas = require("../../middlewares/filtrosPorUsuario/visitas");
const statusCorrecto = require("../../middlewares/filtrosPorUsuario/usStatusCorrecto");
const usAltaTerm = require("../../middlewares/filtrosPorUsuario/usAltaTerm");
const usPenalizaciones = require("../../middlewares/filtrosPorUsuario/usPenalizaciones");
const multer = require("../../middlewares/varios/multer");
const intentosAltaMail = require("../../middlewares/filtrosPorUsuario/intentosAltaMail");
const intentosLogin = require("../../middlewares/filtrosPorUsuario/intentosLogin");
const intentosOlvidoContr = require("../../middlewares/filtrosPorUsuario/intentosOlvidoContr");

// Middlewares - Consolidados
const validarIdentidad = [statusCorrecto, usAltaTerm, usPenalizaciones];

// APIs
router.get("/api/valida-formato-mail", API.valida.formatoMail);
router.get("/api/valida-login", API.valida.login);
router.get("/api/valida-editables", API.valida.editables);
router.get("/api/valida-perennes", API.valida.perennes);
router.get("/api/alta-mail/validaciones", API.altaMail.validaMail);
router.get("/api/alta-mail/envio-de-mail", API.altaMail.envioDeMail);
router.get("/api/olvido-contrasena/datosDeSession", API.olvidoContr.datosDeSession);
router.get("/api/olvido-contrasena/validaciones", API.olvidoContr.validaDatosPer);
router.get("/api/olvido-contrasena/envio-de-mail", API.olvidoContr.envioDeMail);
router.get("/api/video-de-consultas-visto", API.videoConsVisto);

// Vistas - Sólo visitas
router.get("/garantiza-login-y-completo", vista.loginCompleto);
router.get("/alta-mail", intentosAltaMail, visitas, vista.altaMail_olvidoContr);
router.get("/olvido-contrasena", intentosOlvidoContr, visitas, vista.altaMail_olvidoContr);

// Vistas - Editables
router.get("/editables", statusCorrecto, vista.editables.form);
router.post("/editables", statusCorrecto, multer.single("avatar"), vista.editables.guardar);
router.get("/editables-bienvenido", statusCorrecto, vista.editables.bienvenido);

// Vistas - Perennes
router.get("/perennes", validarIdentidad, vista.perennes.form);
router.post("/perennes", validarIdentidad, multer.single("avatar"), vista.perennes.guardar);
router.get("/perennes-bienvenido", validarIdentidad, vista.perennes.bienvenido);

// Vistas - Rutas RUD
router.get("/edicion", usAltaTerm, vista.edicion.form);
router.put("/edicion", usAltaTerm, multer.single("avatar"), vista.edicion.guardar);

// Vistas - Login
router.get("/login", intentosLogin, vista.login.form);
router.post("/login", intentosLogin, visitas, vista.login.guardar);
router.get("/logout", statusCorrecto, vista.login.logout);

// Vista - Miscelaneas
router.get("/:id/suspendido", visitas, vista.miscelaneas.accesosSuspendidos);
router.get("/envio-exitoso-de-mail", visitas, vista.miscelaneas.envioExitoso);
router.get("/envio-fallido-de-mail", visitas, vista.miscelaneas.envioFallido);
router.post("/login/olvido-contrasena", visitas, vista.miscelaneas.olvidoContr); // obtiene datos para redireccionar
router.post("/login/alta-mail", visitas, vista.miscelaneas.altaMail); // obtiene datos para redireccionar

// Fin
module.exports = router;
