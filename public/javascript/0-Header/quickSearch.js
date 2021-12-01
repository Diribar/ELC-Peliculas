window.addEventListener("load", () => {
	// DOM
	let input = document.querySelector("#busquedaRapida input");
	let ul = document.querySelector("#busquedaRapida ul");

	// Variables
	teclasValidas = /^[a-z áéíóúüñ\d]+$/;


	input.addEventListener("input", async () => {
		// Impide los caracteres que no son válidos
		input.value = input.value
			.replace(/[^a-záéíóúüñ\d\s]/gi, "")
			.replace(/ +/g, " ");
		dataEntry = input.value;

		// Termina el proceso si la palabra tiene menos de 4 caracteres
		if (dataEntry.length < 4) {
			ul.classList.add("ocultar")
			return;
		}

		// Elimina palabras repetidas
		palabras = dataEntry.split(" ");
		for (let i = palabras.length - 1; i > 0; i--) {
			if (
				palabras.filter((x) => x == palabras[i]).length > 1 ||
				palabras.filter((x) => x == "").length
			) {
				palabras.splice(i, 1);
			}
		}
		palabras = palabras.join(" ");

		// Busca los productos
		let resultados = await fetch("/quick-search/?palabras=" + palabras).then((n) => n.json());
		resultados = resultados.map((n) => {
			return {
				id: n.id,
				nombre_castellano: n.nombre_castellano,
				ano_estreno: n.ano_estreno,
				entidad: n.entidad,
			};
		});
		datos = resultados.length ? resultados : "- No encontramos coincidencias -";
		//console.log(resultados);
		agregarHallazgos(datos);
	});

	agregarHallazgos = (datos) => {
		input.style.borderBottomLeftRadius = 0
		input.style.borderBottomRightRadius = 0
		ul.innerHTML = "";
		ul.classList.remove("ocultar")
		if (typeof(datos) == "object") {
			for (dato of datos) {
				let li = document.createElement("li");
				li.appendChild(
					document.createTextNode(
						dato.nombre_castellano + " - " + dato.ano_estreno
					)
				);
				ul.appendChild(li);
				console.log(dato)
			}
		} else {
			let li = document.createElement("li");
			li.style.fontStyle = "italic";
			li.style.textAlign = "center";
			li.appendChild(document.createTextNode(datos));
			ul.appendChild(li);
		}
	};
	
});

