// Requires *********************************************************
const express = require('express');
const router = express.Router();
const peliculas = require('../controladores/peliculas')
const opciones = require('../controladores/peliculas_opciones')

// Middlewares ******************************************************
const logoutMiddleware = require('../../middlewares/si_esta_logueado_LOGOUT');  // Para prevenir ciertos accesos cuando SI está logueado
const loginMiddleware = require('../../middlewares/si_no_esta_logueado_LOGIN'); // Para prevenir ciertos accesos cuando NO está logueado

// Controladores CRUD ***********************************************
router.get('/nueva', loginMiddleware, peliculas.altaForm);                      // Alta
router.post('/nueva', loginMiddleware, peliculas.altaGuardar);                  // Alta
router.get('/detalle/:id', peliculas.detalle);                                  // Detalle
router.get('/editar/:id', loginMiddleware, peliculas.editarForm);               // Modificar
router.put('/editar/:id', loginMiddleware, peliculas.editarGuardar);                       // Modificar
router.delete('/eliminar/:id', loginMiddleware, peliculas.baja);                // Baja

// Controladores Opciones *******************************************
router.get('/', opciones.rubro);                                // Home
router.get('/:id', opciones.opcion);                            // Opciones
router.get('/:id/:id', opciones.tipo);                          // Opción: Listado
router.post('/filtros', opciones.filtros);                      // Filtros

// Exportarlo *******************************************************
module.exports = router;
