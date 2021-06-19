window.addEventListener("load", () => {
	const funcionesAPI = require(path.join(
		__dirname,
		"../../modelos/funciones/funcionesAPI"
	));

				let colecciones = await funcionesAPI.colecciones(
					palabras_clave,
					"collection"
				);
				return res.send(colecciones);

})