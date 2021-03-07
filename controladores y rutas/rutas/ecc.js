const express= require('express');
const controlador = require('../controladores/ecc');

const router = express.Router();

router.get('/', controlador.home) // Home
router.get('/:id', controlador.main) // Quiénes Somos, Contáctanos

module.exports = router;
