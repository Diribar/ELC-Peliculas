// Requires *********************************************************
const express = require('express');
const router = express.Router();
const peliculas = require('../controladores/peliculas')
const opciones = require('../controladores/peliculas_opciones')

// Middlewares ******************************************************
const soloUsuarios = require('../../middlewares/soloUsuarios'); // Para prevenir ciertos accesos cuando NO está logueado

// Controladores CRUD ***********************************************
router.get('/nueva', soloUsuarios, peliculas.altaForm);                      // Alta
router.post('/nueva', soloUsuarios, peliculas.altaGuardar);                  // Alta
router.get('/detalle/:id', peliculas.detalle);                                  // Detalle
router.get('/editar/:id', soloUsuarios, peliculas.editarForm);               // Modificar
router.put('/editar/:id', soloUsuarios, peliculas.editarGuardar);            // Modificar
router.delete('/eliminar/:id', soloUsuarios, peliculas.baja);                // Baja

// Controladores Opciones *******************************************
router.get('/', opciones.rubro);                                // Home
router.get('/:id', opciones.opcion);                            // Opciones
router.get('/:id/:id', opciones.tipo);                          // Opción: Listado
router.put('/:id/:id', opciones.filtros);                       // Filtros

// Exportarlo *******************************************************
module.exports = router;
