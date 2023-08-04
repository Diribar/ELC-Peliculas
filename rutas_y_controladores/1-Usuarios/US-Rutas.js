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
router.get("/api/valida-mail", API.validaMail);
router.get("/api/valida-mail-repetido", API.validaMailRepetido);
router.get("/api/valida-login", API.validaLogin);
router.get("/api/valida-editables", API.validaEditables);
router.get("/api/valida-identidad", API.validaIdentidad);
router.get("/api/envio-de-mail", API.envioDeMail);

// Rutas de Altas
// 1. Sólo visitas
router.get("/garantiza-login-y-completo", vista.login_y_completo);
router.get("/alta-mail", visitas, vista.altaMail.form);
router.post("/alta-mail", visitas, vista.altaMail.guardar);
// 2. Solo usuarios con status 'mailValidado'
router.get("/editables", statusCorrecto, vista.editables.form);
router.post("/editables", statusCorrecto, multer.single("avatar"), vista.editables.guardar);
// 3. Solo usuarios con status 'editables'
router.get("/bienvenido", statusCorrecto, vista.editables.bienvenido);
// 4. Solo usuarios con status 'editables' y no penalizadas
router.get("/identidad", validarIdentidad, vista.identidad.form);
router.post("identidad", validarIdentidad, multer.single("avatar"), vista.identidad.guardar);
// 5. Solo usuarios con status 'identPendValidar'
router.get("/validacion-en-proceso", statusCorrecto, vista.identidad.enProceso);

// Rutas RUD
router.get("/edicion", usAltaTerm, vista.edicion.form);
router.put("/edicion", usAltaTerm, multer.single("avatar"), vista.edicion.guardar); //Validar mail y editables

// Login
router.get("/login", visitas, vista.login.form);
router.post("/login", visitas, vista.login.guardar);
router.get("/olvido-contrasena", visitas, vista.altaMail.form);
router.post("/olvido-contrasena", visitas, vista.olvidoContr);
router.get("/logout", statusCorrecto, vista.logout);

module.exports = router;
