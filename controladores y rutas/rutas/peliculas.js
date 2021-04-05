// Requires *********************************************************
const express = require('express');
const router = express.Router();
const peliculas = require('../controladores/peliculas')
const opciones = require('../controladores/peliculas_opciones')

// Middlewares ******************************************************
const soloUsuarios = require('../../middlewares/soloUsuarios');  // Para prevenir ciertos accesos cuando NO está logueado
const soloAdmin = require('../../middlewares/soloAdmin');        // Para prevenir ciertos accesos cuando NO está logueado

// Controladores CRUD ***********************************************
router.get('/nueva', soloAdmin, peliculas.altaForm);            // Alta
router.post('/nueva', peliculas.altaGuardar);                   // Alta
router.get('/editar/:id', soloAdmin, peliculas.editarForm);     // Modificar
router.put('/editar/:id', peliculas.editarGuardar);             // Modificar
router.delete('/eliminar/:id', soloAdmin, peliculas.baja);      // Baja
router.get('/detalle/:id', peliculas.detalle);                  // Detalle

// Controladores Opciones *******************************************
router.get('/', opciones.rubro);                                // Home
router.get('/:id', opciones.opcion);                            // Opciones
router.get('/:id/:id', opciones.tipo);                          // Opción: Listado
router.put('/:id/:id', soloUsuarios, opciones.filtros);         // Filtros

// Exportarlo *******************************************************
module.exports = router;
