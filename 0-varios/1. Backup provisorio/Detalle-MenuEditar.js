window.addEventListener("load", () => {
	// Definir variables
	let linkEditarProd = document.querySelector("#editarProducto");
	let API_EditarProd = "/producto/api/averiguar-si-esta-disponible/?entidad=";

	// Acciones si se le hace 'click'
	linkEditarProd.addEventListener("click", async (e) => {
		// Obtener los parámetros
		url = window.location.search;
		indice = url.indexOf("&id=");
		entidad = url.slice(9, indice);
		id = url.slice(indice + 4);
		// Averiguar si el producto está disponible
		// Campos: status, código, mensaje
		disponible = await fetch(API_EditarProd + entidad + "&id=" + id).then((n) => n.json());
		//console.log(disponible);
		// Acciones si el status es false
		if (!disponible.status) {
			// Si el usuario no está logueado, redirigir a Login
			if (disponible.codigo == "hacerLogin") window.location.href = "/usuarios/login";
			// false --> cartel de "Bloqueado" + motivo
		} // else (true) --> ir a Edicion
	});
});


// averiguarSiEstaDisponible: async (req, res) => {
// 	// Viene con los datos de la entidad y el producto_id
// 	let {entidad, id} = req.query;
// 	// Los envía a una función y recibe 'true/false'
// 	let disponible = req.session.usuario
// 		? await procesar.averiguarSiEstaDisponible(entidad, id, req.session.usuario)
// 		: {status: false, codigo: "hacerLogin"};
// 	// Devuelve la info
// 	return res.json(disponible);
// },

