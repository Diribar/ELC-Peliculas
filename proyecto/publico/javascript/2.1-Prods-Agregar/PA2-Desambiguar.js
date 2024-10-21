"use strict";
window.addEventListener("load", async () => {
	// Variables
	const DOM = {
		mensaje: document.querySelector("#mensaje"),

		// Opciones
		listado: document.querySelector("#listado"),
		ingrManual: document.querySelector("#listado #ingrManual"),
		prodsNuevos: document.querySelector("#listado .prodsNuevos"),
		prodsYaEnBD: document.querySelector("#listado .prodsYaEnBD"),

		// Cartel
		cartelProgreso: document.querySelector("#cartelProgreso"),
		tituloCartel: document.querySelector("#cartelProgreso #titulo"),
		progreso: document.querySelector("#cartelProgreso #progreso"),
	};

	// Obtiene los datos de session
	let desambiguar = await fetch(rutas.infoDeSession).then((n) => n.json());
	if (!desambiguar) location.href = "agregar-pc"; // si no existe, redirige al paso anterior

	// Si corresponde, completa los datos de sesion
	if (!desambiguar.mensaje) desambiguar = await barraProgreso(rutas.pre, APIs_buscar);
	const {prodsNuevos, prodsYaEnBD, mensaje} = desambiguar;

	// Agrega el mensaje
	DOM.mensaje.innerHTML = mensaje ? mensaje.desambiguar : desambiguar;

	// Si hubo un error en los resultados, interrumpe la función
	if (!mensaje) return;

	// Productos nuevos
	if (prodsNuevos.length)
		for (let prod of prodsNuevos) {
			// Crea el elemento 'li'
			let li = DOM.prodsNuevos.cloneNode(true);
			let boton = li.querySelector("button");

			// Información a enviar al BE
			li.querySelector("input[name='TMDB_entidad").value = prod.TMDB_entidad;
			li.querySelector("input[name='TMDB_id").value = prod.TMDB_id;
			li.querySelector("input[name='nombreOriginal").value = prod.nombreOriginal;
			li.querySelector("input[name='idiomaOriginal_id").value = prod.idiomaOriginal_id;

			// Imagen
			let imagen = boton.querySelector("img");
			imagen.src = prod.avatar
				? "https://image.tmdb.org/t/p/original" + prod.avatar
				: "/publico/imagenes/Avatar/Sin-Avatar.jpg";
			imagen.alt = prod.nombreOriginal;
			imagen.title = prod.nombreOriginal;

			// Información a mostrar
			let infoPeli = boton.querySelector("#infoPeli");
			infoPeli.querySelector("#nombreOriginal").innerHTML = prod.nombreOriginal;
			infoPeli.querySelector("#nombreCastellano").innerHTML = prod.nombreCastellano;

			// Completa los años y entidad nombre
			const anos = prod.anoFin && prod.anoFin > prod.anoEstreno ? prod.anoFin + "-" + prod.anoEstreno : prod.anoEstreno;
			infoPeli.querySelector("#anoEstreno").innerHTML = anos + " - " + prod.entidadNombre;

			// Si es una colección, agrega la cantidad de capítulos
			if (prod.entidad == "colecciones")
				infoPeli.querySelector("#capitulos").innerHTML = "Capítulos: " + prod.cantCaps_vTMDB;
			else infoPeli.querySelector("#capitulos").remove();

			// Quita la clase 'ocultar'
			li.classList.remove("ocultar");

			// Agrega el form
			DOM.listado.insertBefore(li, DOM.ingrManual);
		}

	// Productos ya en BD
	if (prodsYaEnBD.length)
		for (let prod of prodsYaEnBD) {
			// Crea el elemento 'li'
			let li = DOM.prodsYaEnBD.cloneNode(true);
			let boton = li.querySelector("a button");

			// Información a enviar al BE
			li.querySelector("a").href = "/" + prod.entidad + "/detalle/p/?id=" + prod.id;

			// Imagen
			let avatar = !prod.avatar
				? "/publico/imagenes/Avatar/Sin-Avatar.jpg"
				: prod.avatar.includes("/")
				? prod.avatar
				: "/Externa/2-Productos/Final/" + prod.avatar;
			let imagen = boton.querySelector("img");
			imagen.src = avatar;
			imagen.alt = prod.nombreOriginal;
			imagen.title = prod.nombreOriginal;
			// Información a mostrar
			let infoPeli = boton.querySelector("#infoPeli");
			infoPeli.querySelector("#nombreOriginal").innerHTML = prod.nombreOriginal;
			infoPeli.querySelector("#nombreCastellano").innerHTML = prod.nombreCastellano;
			infoPeli.querySelector("#anoEstreno").innerHTML = prod.anoEstreno + " - " + prod.entidadNombre;
			// Quita la clase 'ocultar'
			li.classList.remove("ocultar");

			// Agrega el form
			DOM.listado.append(li);
		}

	// Elimina los forms modelo, que ya no se necesitan más
	DOM.prodsNuevos.remove();
	DOM.prodsYaEnBD.remove();

	// Miscelaneas
	document.querySelector("#listado li button").focus(); // Hace foco en el primer producto
	desplazamHoriz(); // Desplazamiento original
	accionesAlElegirProdNuevo(DOM); // Acciones luego de elegir un producto nuevo
});

// Variables
rutas.actualiza = "obtiene-mas-info-del-prod/?datos=";
rutas.valida = "valida-ds";
rutas.im = "crea-session-im";
rutas.infoDeSession = rutas.pre + rutas.buscaInfo;

// Funciones
const accionesAlElegirProdNuevo = (DOM) => {
	// Variables
	DOM.forms = document.querySelectorAll(".prodsNuevos form");
	let yaEligio;

	// Acciones al elegir un producto nuevo
	for (let form of DOM.forms)
		form.addEventListener("submit", async (e) => {
			// Frena el POST
			e.preventDefault();

			// Pasa/no pasa
			if (yaEligio) return;
			else yaEligio = true;

			// Muestra el cartelProgreso
			DOM.tituloCartel.innerHTML = "Procesando la información...";

			// Obtiene los datos
			let datos = {
				TMDB_entidad: e.target[0].value,
				TMDB_id: e.target[1].value,
				nombreOriginal: encodeURIComponent(e.target[2].value), // Es necesario porque sólo se consigue mediante 'search'
				idiomaOriginal_id: e.target[3].value, // Es necesario porque sólo se consigue mediante 'search'
			};

			// Actualiza Datos Originales y averigua si la info tiene errores
			const APIs = [
				{ruta: rutas.actualiza + JSON.stringify(datos), duracion: 900},
				{ruta: rutas.valida, duracion: 200},
			];
			errores = await barraProgreso(rutas.pre, APIs);

			// Fin
			if (errores.hay) location.href = "agregar-dd";
			else location.href = "agregar-da";
		});

	// Deriva a IM
	DOM.ingrManual.addEventListener("click", async (e) => {
		await fetch(rutas.pre + rutas.im);
		location.href = "agregar-im";
		return;
	});
};
