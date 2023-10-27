"use strict";
//************************* Requires *******************************
const router = express.Router();
const API = require("./US-ControlAPI");
const vista = require("./US-ControlVista");

//************************ Middlewares ******************************
const visitas = require("../../middlewares/filtrosPorUsuario/visitas");
const statusCorrecto = require("../../middlewares/filtrosPorUsuario/usStatusCorrecto");
const usAltaTerm = require("../../middlewares/filtrosPorUsuario/usAltaTerm");
const usPenalizaciones = require("../../middlewares/filtrosPorUsuario/usPenalizaciones");
const multer = require("../../middlewares/varios/multer");
// Grupos
const validarIdentidad = [statusCorrecto, usAltaTerm, usPenalizaciones];
//************************ Rutas ****************************
// Rutas de APIs
router.get("/api/valida-formato-mail", API.valida.formatoMail); // alta-de-mail, olvido-de-contraseña
router.get("/api/valida-login", API.valida.login);
router.get("/api/valida-editables", API.valida.editables);
router.get("/api/valida-perennes", API.valida.perennes);
router.get("/api/alta-mail", API.fin.altaMail);
router.get("/api/olvido-contrasena", API.fin.olvidoContrasena);
router.get("/api/video-de-consultas-visto", API.videoConsVisto);

// Rutas de Altas
// 1. Sólo visitas
router.get("/garantiza-login-y-completo", vista.login_y_completo);
router.get("/alta-mail", visitas, vista.altaMail.form);
router.get("/olvido-contrasena", visitas, vista.altaMail.form);
router.get("/envio-exitoso-de-mail", visitas, vista.altaMail.envioExitoso);
router.get("/envio-fallido-de-mail", visitas, vista.altaMail.envioFallido);

// 2. Editables
router.get("/editables", statusCorrecto, vista.editables.form);
router.post("/editables", statusCorrecto, multer.single("avatar"), vista.editables.guardar);
router.get("/editables-bienvenido", statusCorrecto, vista.editables.bienvenido);

// 3. Perennes
router.get("/perennes", validarIdentidad, vista.perennes.form);
router.post("/perennes", validarIdentidad, multer.single("avatar"), vista.perennes.guardar);
router.get("/perennes-bienvenido", statusCorrecto, vista.perennes.bienvenido);

// Rutas RUD
router.get("/edicion", usAltaTerm, vista.edicion.form);
router.put("/edicion", usAltaTerm, multer.single("avatar"), vista.edicion.guardar); //Validar mail y registrado

// Login
router.get("/login", visitas, vista.login.form);
router.post("/login", visitas, vista.login.guardar);
router.get("/logout", statusCorrecto, vista.logout);

module.exports = router;
