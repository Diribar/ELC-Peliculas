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

// Middlewares - Consolidados
const validarIdentidad = [statusCorrecto, usAltaTerm, usPenalizaciones];

// APIs
router.get("/api/valida-formato-mail", API.valida.formatoMail);
router.get("/api/valida-login", API.valida.login);
router.get("/api/valida-editables", API.valida.editables);
router.get("/api/valida-perennes", API.valida.perennes);
router.get("/api/alta-mail/valida-mail", API.altaMail.validaMail);
router.get("/api/alta-mail/envio-de-mail", API.altaMail.envioDeMail);
router.get("/api/olvido-contrasena/valida-mail", API.olvidoContrasena.validaMail);
router.get("/api/olvido-contrasena/envio-de-mail", API.olvidoContrasena.envioDeMail);
router.get("/api/video-de-consultas-visto", API.videoConsVisto);

// Vistas - Sólo visitas
router.get("/garantiza-login-y-completo", vista.loginCompleto);
router.get("/alta-mail", visitas, vista.altaMail.form);
router.get("/olvido-contrasena", visitas, vista.altaMail.form);
router.post("/olvido-contrasena", visitas, vista.altaMail.guardar);
router.get("/envio-exitoso-de-mail", visitas, vista.altaMail.envioExitoso);
router.get("/envio-fallido-de-mail", visitas, vista.altaMail.envioFallido);

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

// Vistas -Login
router.get("/login", vista.login.form);
router.get("/login/suspendido", vista.login.loginSuspendido);
router.post("/login", visitas, vista.login.guardar);
router.get("/logout", statusCorrecto, vista.logout);

// Fin
module.exports = router;
