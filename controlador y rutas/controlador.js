const controlador = {
	home: (req,res) => {res.render('ecc')},
	main: (req,res) => {res.render(req.params.id)},
};

module.exports = controlador;
