// ************ Requires ************
let procesarProductos = require("./PROD-procesar");

module.exports = {
	palabrasClave: (dato) => {
		cartelCampoVacio = "Necesitamos que completes este campo";
		let errores = {};
		errores.palabras_clave = !dato
			? cartelCampoVacio
			: longitud(dato, 2, 20)
			? longitud(dato, 2, 20)
			: "";
		return errores;
	},

	copiarFA: (datos) => {
		let errores = {};
		// Rubro
		errores.rubroAPI = !datos.rubroAPI ? "Elegí una opción" : "";
		// Dirección
		aux = datos.direccion;
		errores.direccion = !aux
			? cartelCampoVacio
			: !aux.includes("www.filmaffinity.com/") ||
			  !(
					aux.indexOf("www.filmaffinity.com/") + 21 <
						aux.indexOf("/film") &&
					aux.indexOf("/film") + 5 < aux.indexOf(".html")
			  )
			? "No parece ser una dirección de Film Affinity"
			: "";
		// Avatar
		errores.avatar = !datos.avatar
			? "Necesitamos que agregues una imagen"
			: !datos.avatar.includes("pics.filmaffinity.com/")
			? "No parece ser una imagen de FilmAffinity"
			: !datos.avatar.includes("large.jpg")
			? "Necesitamos que consigas el link de la imagen grande"
			: "";
		// Contenido
		aux = datos.contenido
			? procesarProductos.contenidoFA(datos.contenido)
			: {};
		errores.contenido = !datos.contenido
			? cartelCampoVacio
			: !Object.keys(aux).length
			? "No se obtuvo ningún dato"
			: "";
		// Final
		errores.hay = hayErrores(errores);
		errores.campos = Object.keys(aux).length;
		return errores;
	},

	datosDuros: (datos) => {
		let errores = {};
		errores.nombre_original = !datos.nombre_original
			? cartelCampoVacio
			: longitud(datos.nombre_original, 2, 50)
			? longitud(datos.nombre_original, 2, 50)
			: castellano(datos.nombre_original)
			? cartelCastellano
			: "";
		errores.nombre_castellano = !datos.nombre_castellano
			? cartelCampoVacio
			: longitud(datos.nombre_castellano, 2, 50)
			? longitud(datos.nombre_castellano, 2, 50)
			: castellano(datos.nombre_castellano)
			? cartelCastellano
			: "";
		errores.ano_estreno = !datos.ano_estreno
			? cartelCampoVacio
			: formatoAno(datos.ano_estreno)
			? "Debe ser un número de 4 dígitos"
			: datos.ano_estreno < 1900
			? "El año debe ser mayor a 1900"
			: datos.ano_estreno > new Date().getFullYear()
			? "El número no puede superar al año actual"
			: "";
		errores.duracion = !datos.duracion
			? cartelCampoVacio
			: formatoNumero(datos.duracion, 20)
			? formatoNumero(datos.duracion, 20)
			: datos.duracion > 300
			? "Debe ser un número menor"
			: "";
		errores.pais_id = !datos.pais_id ? cartelCampoVacio : "";
		errores.director = !datos.director
			? cartelCampoVacio
			: longitud(datos.director, 2, 50)
			? longitud(datos.director, 2, 50)
			: castellano(datos.director)
			? cartelCastellano
			: "";
		errores.guion = !datos.guion
			? cartelCampoVacio
			: longitud(datos.guion, 2, 50)
			? longitud(datos.guion, 2, 50)
			: castellano(datos.guion)
			? cartelCastellano
			: "";
		errores.musica = !datos.musica
			? cartelCampoVacio
			: longitud(datos.musica, 2, 50)
			? longitud(datos.musica, 2, 50)
			: castellano(datos.musica)
			? cartelCastellano
			: "";
		errores.actores = !datos.actores
			? cartelCampoVacio
			: longitud(datos.actores, 2, 500)
			? longitud(datos.actores, 2, 500)
			: castellano(datos.actores)
			? cartelCastellano
			: "";
		errores.productor = !datos.productor
			? cartelCampoVacio
			: longitud(datos.productor, 2, 100)
			? longitud(datos.productor, 2, 100)
			: castellano(datos.productor)
			? cartelCastellano
			: "";
		errores.avatar =
			datos.avatar == "/imagenes/0-Base/Agregá una imagen.jpg"
				? "Necesitamos que agregues una imagen"
				: extensiones(datos.avatar)
				? "Las extensiones de archivo válidas son jpg, png, gif, bmp"
				: "";
		errores.hay = hayErrores(errores);
		return errores;
	},
};

let cartelCampoVacio = "Necesitamos que completes esta información";
let cartelCastellano =
	"Sólo se admiten letras del abecedario castellano, y la primera letra debe ser en mayúscula";

let longitud = (dato, corto, largo) => {
	return dato.length < corto
		? "El nombre debe ser más largo"
		: dato.length > largo
		? "El nombre debe ser más corto"
		: "";
};
let castellano = (dato) => {
	formato = /^[A-Z][A-ZÁÉÍÓÚÜÑa-z ,.:áéíóúüñ'/()\d+-]+$/;
	return !formato.test(dato);
};
let formatoAno = (dato) => {
	formato = /^\d{4}$/;
	return !formato.test(dato);
};
let formatoNumero = (dato, minimo) => {
	formato = /^\d+$/;
	return !formato.test(dato)
		? "Debe ser un número"
		: dato < minimo
		? "Debe ser un número mayor a " + minimo
		: "";
};
let extensiones = (nombre) => {
	if (!nombre) return false;
	ext = nombre.slice(nombre.length - 4);
	return ![".jpg", ".png", ".gif", ".bmp"].includes(ext);
};
let hayErrores = (errores) => {
	resultado = false;
	valores = Object.values(errores);
	for (valor of valores) {
		valor ? (resultado = true) : "";
	}
	return resultado;
};
