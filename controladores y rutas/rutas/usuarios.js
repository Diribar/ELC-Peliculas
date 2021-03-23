//************************* Requires *******************************
const express = require('express');
const router = express.Router();
const usuarios = require('../controladores/usuarios')

//************************ Middlewares ******************************
const uploadFile = require('../../middlewares/multer');            // Para usar archivos en formularios 
const validarMailContrasena = require('../../middlewares/validarMailContrasena');    // Validar mail y contraseña
const validarDatosUsuario = require('../../middlewares/validarDatosUsuario');    // Validar mail y contraseña
const logoutMiddleware = require('../../middlewares/si_esta_logueado_LOGOUT');  // Para prevenir ciertos accesos cuando SI está logueado
const loginMiddleware = require('../../middlewares/si_no_esta_logueado_LOGIN');  // Para prevenir ciertos accesos cuando NO está logueado

//************************ Controladores ****************************
router.get('/registro-mail', logoutMiddleware, usuarios.altaFormMail)
router.post('/registro-mail', logoutMiddleware, validarMailContrasena, usuarios.altaGuardarMail)

router.get('/registro-nombre', loginMiddleware, usuarios.altaFormNombre)
router.post('/registro-nombre', loginMiddleware, uploadFile.single('imagen'), validarDatosUsuario, usuarios.altaGuardarNombre)

router.get('/detalle', loginMiddleware, usuarios.detalle)          // Detalle
router.get('/editar', loginMiddleware, usuarios.editarForm)        // Modificar
router.put('/editar', loginMiddleware, uploadFile.single('imagen'), validarMailContrasena, validarDatosUsuario, usuarios.editarGuardar)
router.delete('/eliminar', loginMiddleware, usuarios.baja)         // Baja

module.exports = router;
