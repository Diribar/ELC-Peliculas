window.addEventListener("load", async () => {
	// Variables
	let producto_id = new URL(window.location.href).searchParams.get("id");
	let vista = window.location.pathname;

	// Obtener el ID de la colección
	let ruta = "/producto/tridente/api/obtener-col-cap/?entidad=capitulos&id=";
	let coleccion_id = await fetch(ruta + producto_id).then((n) => n.json());

	// Obtener DOM de Temporada y Capítulos
	let temporada = document.querySelector("#encabezado select#temporada");
	let capitulo = document.querySelector("#encabezado select#capitulo");

	// Si cambia Temp --> actualizar los capítulos
	temporada.addEventListener("change", async () => {
		// Obtener los 2 datos para conseguir el capID
		let col = coleccion_id;
		let temp = temporada.value.slice(10);
		// Obtener los capítulos de la temporada
		ruta = "/producto/agregar/api/TP-averiguar-capitulos/";
		let capitulos = await fetch(ruta + "?coleccion_id=" + col + "&temporada=" + temp).then(
			(n) => n.json()
		);
		// Eliminar las opciones actuales
		capitulo.innerHTML = "<option selected class='ocultar'>Elegí</option>";
		// Agregar las nuevas opciones
		for (cap of capitulos) {
			capitulo.innerHTML += "<option>Capítulo " + cap + "</option>";
		}
	});

	// Si cambia el capítulo --> cambiar el url
	capitulo.addEventListener("change", async () => {
		// Obtener los 3 datos para conseguir el capID
		let col = coleccion_id;
		let temp = temporada.value.slice(10);
		let cap = capitulo.value.slice(9);
		// Obtener el capID
		ruta = "/producto/tridente/api/obtener-cap-id/?entidad=capitulos";
		let capID = await fetch(
			ruta + "&coleccion_id=" + col + "&temporada=" + temp + "&capitulo=" + cap
		).then((n) => n.json());
		window.location.href = vista + "?entidad=capitulos&id=" + capID;
	});
});
