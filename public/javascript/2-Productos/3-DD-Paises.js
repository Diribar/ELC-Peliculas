window.addEventListener("load", async () => {
	// Objetivo: agregar/quitar países que se vayan seleccionando

	// Declarar las variables
	let mostrarPaises = document.querySelector("#dataEntry #paises_id #mostrarPaises");
	let paises_id = document.querySelector("#dataEntry #paises_id input[name='paises_id']");
	let select = document.querySelector("#dataEntry #paises_id select");
	let paises = await fetch("/producto/agregar/api/DD-paises").then((n) => n.json());

	// Si se hace 'click' un país,
	select.addEventListener("change", () => {
		let paisId = select.value;
		// Verificar si figura en paises_id
		let agregar = !paises_id.value.includes(paisId);
		// Si no figura en paises_id, agregárselo
		if (agregar) {
			// Limita la cantidad máxima de países a 1+5 = 6
			if (paises_id.value.length >= 2 * 1 + 4 * 5) return;
			paises_id.value += !paises_id.value ? paisId : ", " + paisId;
		} else {
			// Si sí figura, quitárselo
			paises_idArray = paises_id.value.split(", ");
			indice = paises_idArray.indexOf(paisId);
			paises_idArray.splice(indice, 1);
			paises_id.value = paises_idArray.join(", ");
		}
		// Agregar los países a mostrar
		mostrarPaises.value = "";
		if (paises_id.value) paises_idArray = paises_id.value.split(", ");
		else return;
		for (pais_id of paises_idArray) {
			paisNombre = paises.find((n) => n.id == pais_id).nombre;
			mostrarPaises.value += !mostrarPaises.value ? paisNombre : ", " + paisNombre;
		}
	});
});
