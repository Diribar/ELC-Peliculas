const controlador = {
	home: (req,res) => {res.render('ecc')},
	peliculas: (req,res) => {res.render('pel-home')},
	peli_filtros: (req,res) => {
		let user_entry = req.query;
		let pelis = [{nombre: "San Francisco de Asís"},{nombre: "Un hombre para la eternidad"},{nombre: "Molokai"},];
		let results = [];
		for (let i=0; i < pelis.length; i++) {
			if (pelis[i].nombre.toLowerCase().includes(user_entry.palabras_clave.toLowerCase())) {results.push(pelis[i])}
		}
		res.send(results);
/*		res.render('página-de-resultados', results); */
	},
	main: (req,res) => {res.render(req.params.id)},
};

module.exports = controlador;
