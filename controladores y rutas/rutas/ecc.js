const express= require('express');
const controlador = require('../controladores/ecc')

const router = express.Router();
router.get('/:id', controlador.main) // Home, Quiénes Somos, Contáctanos
module.exports = router;
