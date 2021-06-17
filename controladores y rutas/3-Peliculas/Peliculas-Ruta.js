//************************* Requires *******************************
const express = require('express');
const router = express.Router();
const peliculas = require("./PEL-CRUD-Contr");
const opciones = require("./PEL-Opc-Contr");

//************************ Middlewares ******************************
const soloUsuarios = require("../../middlewares/usuarios/soloUsuarios");
const validar1 = require("../../middlewares/PEL-0-validarForms/1-ImportarDatos");
const validar2 = require("../../middlewares/PEL-0-validarForms/2_DatosDuros");
const validar3 = require("../../middlewares/PEL-0-validarForms/3_DatosElaborados");
const importarA = require("../../middlewares/PEL-1A-importar_x_API/1importarA");
const uploadFile = require("../../middlewares/varios/multer");

//******************* Controladores de CRUD *************************
// -- Responsabilidad -------------------------
router.get("/agregar", soloUsuarios, peliculas.responsabilidad);
// -- Importar Datos --------------------------
router.get("/agregar1", soloUsuarios, peliculas.alta1Form);
router.post('/agregar1', soloUsuarios, validar1, peliculas.alta1Guardar);

// -- Desambiguar --------------------------

// -- Datos Duros -----------------------------
router.get("/agregar2", soloUsuarios, peliculas.altaForm2);
router.post("/agregar2", soloUsuarios, validar2, peliculas.altaGuardar2);

// -- Datos Adicionales -----------------------
router.get("/agregar3", soloUsuarios, peliculas.altaForm3);
router.post('/agregar3', soloUsuarios, uploadFile.single('imagen'), validar3, peliculas.altaGuardar3);

// -- RUD (GET) --------------------------
router.get("/detalle/editar/:id", soloUsuarios, peliculas.detalle);
router.get("/detalle/eliminar/:id", soloUsuarios, peliculas.detalle);
router.get('/detalle/calificala/:id', soloUsuarios, peliculas.detalle);
router.get('/detalle/:id/:id', peliculas.detalle);
// -- UD (POST) -------------------------
router.post("/detalle/editar/:id", soloUsuarios, peliculas.editarGuardar);
router.post("/detalle/eliminar/:id", soloUsuarios, peliculas.bajaGuardar);

// Controladores de Opciones ****************************************
router.get('/', opciones.rubro);                                // Home
router.get('/:id', opciones.opcion);                            // Opciones
router.get('/:id/:id', opciones.tipo);                          // Opción: Listado
router.post('/:id/:id', soloUsuarios, opciones.filtros);        // Filtros

// Exportarlo *******************************************************
module.exports = router;
