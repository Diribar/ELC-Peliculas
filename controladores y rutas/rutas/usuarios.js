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
router.get('/registro', logoutMiddleware, usuarios.altaForm)                         // Alta
// verificar que no esté logueado
router.post('/registro', logoutMiddleware, validarMailContrasena, usuarios.altaGuardar)       // Alta
// verificar que no esté logueado

router.get('/detalle', loginMiddleware, usuarios.detalle)          // Detalle
//router.get('/datos', loginMiddleware, usuarios.altaFormDatos)               // Alta
//router.post('/datos', loginMiddleware, uploadFile.single('imagen'), validarDatosUsuario, usuarios.altaGuardarDatos)
router.get('/editar', loginMiddleware, usuarios.editarForm)        // Modificar
router.put('/editar', loginMiddleware, uploadFile.single('imagen'), validarMailContrasena, validarDatosUsuario, usuarios.editarGuardar)
router.delete('/eliminar', loginMiddleware, usuarios.baja)         // Baja

module.exports = router;
