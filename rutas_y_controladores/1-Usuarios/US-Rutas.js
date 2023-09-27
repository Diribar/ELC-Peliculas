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
router.get("/api/valida-identidad", API.valida.identidad);
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

// 2. Solo usuarios con status 'mailValidado'
router.get("/editables", statusCorrecto, vista.editables.form);
router.post("/editables", statusCorrecto, multer.single("avatar"), vista.editables.guardar);
// 3. Solo usuarios con status 'registrado'
router.get("/bienvenido", statusCorrecto, vista.registradoBienvenido);
// 4. Solo usuarios con status 'registrado' y no penalizadas
router.get("/identidad", validarIdentidad, vista.identidad.form);
router.post("/identidad", validarIdentidad, multer.single("avatar"), vista.identidad.guardar);
// 5. Solo usuarios con status 'identPendValidar'
router.get("/validacion-en-proceso", statusCorrecto, vista.identidad.enProceso);

// Rutas RUD
router.get("/edicion", usAltaTerm, vista.edicion.form);
router.put("/edicion", usAltaTerm, multer.single("avatar"), vista.edicion.guardar); //Validar mail y registrado

// Login
router.get("/login", visitas, vista.login.form);
router.post("/login", visitas, vista.login.guardar);
router.get("/logout", statusCorrecto, vista.logout);

module.exports = router;
