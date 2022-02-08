window.addEventListener("load", async () => {
	// Variables generales
	let form = document.querySelector("form");
	let button = document.querySelector("form button[type='submit']");
	let entidad = document.querySelector("#entidad").innerHTML;
	let inputs = document.querySelectorAll("#datos .input");
	let iconoError = document.querySelectorAll("#datos .fa-times-circle");
	let mensajesError = document.querySelectorAll("#datos .mensajeError");

	// Campos combinados - nombre_original
	let nombre_original = document.querySelector("#datos input[name='nombre_original']");
	let iconoErrorNO = document.querySelector("#datos .fa-times-circle.nombre_original");
	let mensajesErrorNO = document.querySelector("#datos .mensajeError.nombre_original");
	// Campos combinados - nombre_castellano
	let nombre_castellano = document.querySelector("#datos input[name='nombre_castellano']");
	let iconoErrorNC = document.querySelector("#datos .fa-times-circle.nombre_castellano");
	let mensajesErrorNC = document.querySelector("#datos .mensajeError.nombre_castellano");
	// Campos combinados - ano_estreno
	let ano_estreno = document.querySelector("#datos input[name='ano_estreno']");
	let mensajesErrorAE = document.querySelector("#datos .mensajeError.ano_estreno");

	// Variables de país
	let paisesMostrar = document.querySelector("#paises_id #mostrarPaises"); // Lugar donde mostrar los nombres
	let paisesID = document.querySelector("#paises_id input[name='paises_id']"); // Lugar donde almacenar los ID
	let paisesSelect = document.querySelector("#paises_id select");
	let paisesListado = Array.from(document.querySelectorAll("#paises_id select option")).map(
		(n) => {
			return {id: n.value, nombre: n.innerHTML};
		}
	);
	console.log(paisesID.value);

	// Otras variables
	let ruta = "/producto/api/validar-editar/?";

	// ****************** FIN DE VARIABLES ***************************

	// Respuestas OK/Error ante cambios 'change' en el form
	form.addEventListener("change", async (e) => {
		// 1. Definir los valores para 'campo' y 'valor'
		if (e.target == paisesSelect) funcionPaises();
		campo = e.target == paisesSelect ? paisesID.name : e.target.name;
		valor = e.target == paisesSelect ? paisesID.value : e.target.value;
		// 2. Revisar CAMPOS INDIVIDUALES
		// Averiguar si hay algún error
		let errores = await fetch(ruta + campo + "=" + valor).then((n) => n.json());
		console.log(campo);
		if (e.target == paisesSelect) campo = paisesID.name;
		mensajesError[i].innerHTML = errores[campo];

		// 3. Revisar CAMPOS COMBINADOS --> Ejemplos:
		// 3.A. (Título original / castellano) + año lanzamiento
		if (
			(campo == "nombre_original" || campo == "ano_estreno") &&
			nombre_original.value &&
			!mensajesErrorNO.innerHTML &&
			ano_estreno.value &&
			!mensajesErrorAE.innerHTML
		)
			errorNO = funcionTituloDuplicado("nombre_original", nombre_original.value);
		if (
			(campo == "nombre_castellano" || campo == "ano_estreno") &&
			nombre_castellano.value &&
			!mensajesErrorNC.innerHTML &&
			ano_estreno.value &&
			!mensajesErrorAE.innerHTML
		)
			errorNC = funcionTituloDuplicado("nombre_castellano", nombre_castellano.value);
		// 3.B. Año de lanzamiento + Año de finalización
		// 3.C. Subcategoría + RCLV

		// 4. Acciones en función de si hay o no mensajes de error
			if (mensajesError[i].innerHTML) {
				iconoError[i].classList.remove("ocultar");
				button.classList.add("botonSinLink");
			} else {
				iconoError[i].classList.add("ocultar");
				botonSubmit();
			}
	});

	// Respuestas 'botonSinLink' ante cambios de 'flechas'

	// Submit
	form.addEventListener("submit", (e) => {
		if (button.classList.contains("botonSinLink")) e.preventDefault();
	});

	// Funciones
	let funcionPaises = () => {
		let paisID = paisesSelect.value;
		if (paisID == "borrar") {
			paisesSelect.value = "";
			paisesMostrar.value = "";
			paisesID.value = "";
			return;
		}
		// Verificar si figura en paisesID
		let agregar = !paisesID.value.includes(paisID);
		// Si no figura en paisesID, agregárselo
		if (agregar) {
			// Limita la cantidad máxima de países a 1+4 = 5, para permitir el mensaje de error
			if (paisesID.value.length >= 2 * 1 + 4 * 4) return;
			paisesID.value += !paisesID.value ? paisID : ", " + paisID;
		} else {
			// Si sí figura, quitárselo
			paises_idArray = paisesID.value.split(", ");
			indice = paises_idArray.indexOf(paisID);
			paises_idArray.splice(indice, 1);
			paisesID.value = paises_idArray.join(", ");
		}
		// Agregar los países a mostrar
		paisesNombre = "";
		if (paisesID.value) {
			paises_idArray = paisesID.value.split(", ");
			for (pais_id of paises_idArray) {
				paisNombre = paisesListado.find((n) => n.id == pais_id).nombre;
				paisesNombre += (paisesNombre ? ", " : "") + paisNombre;
			}
		}
		paisesMostrar.value = paisesNombre;
	};

	let funcionTituloDuplicado = async (campo, valor) => {
		// Obtener el mensaje para el campo
		dato1 = "entidad=" + entidad;
		dato2 = campo + "=" + valor;
		dato3 = "ano_estreno=" + ano_estreno.value;
		let mensaje = await fetch(ruta + dato1 + "&" + dato2 + "&" + dato3).then((n) => n.json());
		if (mensaje) mensaje = mensaje[campo];
		// Impactar en la vista
		campo == "nombre_original"
			? (mensajesErrorNO.innerHTML = mensaje)
			: (mensajesErrorNC.innerHTML = mensaje);
		// Acciones en función de si hay o no mensajes de error
		if (mensaje) {
			campo == "nombre_original"
				? iconoErrorNO.classList.remove("ocultar")
				: iconoErrorNC.classList.remove("ocultar");
			button.classList.add("botonSinLink");
		} else {
			campo == "nombre_original"
				? iconoErrorNO.classList.add("ocultar")
				: iconoErrorNC.classList.add("ocultar");
			botonSubmit();
		}
		return !!mensaje;
	};

	let botonSubmit = () => {
		Array.from(mensajesError).find((n) => n.innerHTML)
			? button.classList.add("botonSinLink")
			: button.classList.remove("botonSinLink");
	};
});
