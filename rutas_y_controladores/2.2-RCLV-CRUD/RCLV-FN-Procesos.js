"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = {
	resumen: async (RCLV, cantProdsEnBD) => {
		// Variable fecha
		let diaDelAno = await BD_genericas.obtienePorId("dias_del_ano", RCLV.dia_del_ano_id);
		let dia = diaDelAno.dia;
		let mes = mesesAbrev[diaDelAno.mes_id - 1];
		let fecha = dia + "/" + mes;
		// Variable ultimaActualizacion
		let fechas = [RCLV.creado_en, RCLV.alta_analizada_en, RCLV.editado_en];
		fechas.push(RCLV.edic_analizada_en, RCLV.sugerido_en);
		let ultimaActualizacion = comp.fechaTexto(new Date(Math.max(...fechas)));
		// Variable status
		let creado = RCLV.status_registro.gr_creado;
		let aprobado = RCLV.status_registro.aprobado;
		let statusResumido = creado
			? {id: 1, nombre: "Pend. Aprobac."}
			: aprobado
			? {id: 2, nombre: "Aprobado"}
			: {id: 3, nombre: "Inactivado"};

		// Comienza a armar el resumen
		let resumenRCLV = [{titulo: "Nombre", valor: RCLV.nombre}];
		if (RCLV.apodo) resumenRCLV.push({titulo: "Alternativo", valor: RCLV.apodo});
		resumenRCLV.push({titulo: "Día del año", valor: fecha});
		if (RCLV.entidad == "personajes" && RCLV.categoria_id == "CFC")
			resumenRCLV.push(
				{titulo: "Proceso Canonizac.", valor: comp.valorNombre(RCLV.proc_canoniz, "Ninguno")},
				{titulo: "Rol en la Iglesia", valor: comp.valorNombre(RCLV.rol_iglesia, "Ninguno")},
				{titulo: "Aparición Mariana", valor: comp.valorNombre(RCLV.ap_mar, "Ninguno")}
			);
		// Datos del registro
		let valorNombreApellido = (valor) => {
			return valor ? valor.nombre + " " + valor.apellido : "Ninguno";
		};
		let resumenRegistro = [];
		resumenRegistro.push(
			{titulo: "Registro creado por", valor: valorNombreApellido(RCLV.creado_por)},
			{titulo: "Registro creado en", valor: comp.fechaTexto(RCLV.creado_en)},
			{titulo: "Alta analizada por", valor: valorNombreApellido(RCLV.alta_analizada_por)},
			{titulo: "Última actualizac.", valor: ultimaActualizacion},
			{titulo: "Productos en BD", valor: cantProdsEnBD},
			{titulo: "Status del registro", valor: statusResumido.nombre, id: statusResumido.id}
		);
		// Fin
		return {resumenRCLV, resumenRegistro};
	},
	prodsYaEnBD: (entProductos, RCLV) => {
		// Variables
		let prodsYaEnBD = [];
		// Completar la información de cada registro
		entProductos.forEach((entidad) => {
			let aux = RCLV[entidad].map((n) => {
				let avatar = n.avatar.includes("/")
					? n.avatar
					: "/imagenes/" +
					  (!n.avatar ? "0-Base/AvatarGenericoProd.jpg" : "3-Productos/" + n.avatar);
				return {...n, entidad, avatar, prodNombre: comp.obtieneEntidadNombre(entidad)};
			});
			prodsYaEnBD.push(...aux);
		});
		// Ordenar por año (decreciente)
		prodsYaEnBD.sort((a, b) =>
			a.ano_estreno > b.ano_estreno ? -1 : a.ano_estreno < b.ano_estreno ? 1 : 0
		);
		// Separa entre colecciones y resto
		let colecciones = prodsYaEnBD.filter((n) => n.entidad == "colecciones");
		let noColecciones = prodsYaEnBD.filter((n) => n.entidad != "colecciones");
		// Elimina capitulos si las colecciones están presentes
		let coleccionesId = colecciones.map((n) => n.id);
		for (let i = noColecciones.length - 1; i >= 0; i--)
			if (coleccionesId.includes(noColecciones[i].coleccion_id)) noColecciones.splice(i, 1);
		// Fin
		prodsYaEnBD = [...colecciones, ...noColecciones];
		return prodsYaEnBD;
	},
	procCanoniz: async (RCLV) => {
		// Variables
		let procCanoniz = "";
		// Averigua si el RCLV tiene algún "proceso de canonización"
		if (RCLV.proceso_id) {
			// Obtiene los procesos de canonización
			let proceso = await BD_genericas.obtieneTodos("procs_canoniz", "orden").then((n) =>
				n.find((m) => m.id == RCLV.proceso_id)
			);
			// Asigna el nombre del proceso
			procCanoniz = proceso.nombre + " ";
			// Verificación si el nombre del proceso es "Santo" (varón)
			if (RCLV.proceso_id == "STV") {
				// Nombres que llevan el prefijo "Santo"
				let nombresEspeciales = ["Domingo", "Tomás", "Tomé", "Toribio"];
				// Obtiene el primer nombre del RCLV
				let nombre = RCLV.nombre;
				nombre = nombre.includes(" ") ? nombre.slice(0, nombre.indexOf(" ")) : nombre;
				// Si el primer nombre no es "especial", cambia el prefijo por "San"
				if (!nombresEspeciales.includes(nombre)) procCanoniz = "San ";
			}
		}
		// Fin
		return procCanoniz;
	},
	guardarCambios: async (req, res, DE) => {
		// Variables
		let entidad = req.query.entidad;
		let origen = req.query.origen;
		let userID = req.session.usuario.id;
		const codigo = req.baseUrl + req.path;
		// Tareas
		if (codigo == "/rclv/agregar/") {
			// Guarda el nuevo registro
			let id = await comp.creaRegistro(entidad, DE, userID);
			// Agregar el RCLV a DP/ED
			let entidad_id = comp.obtieneEntidad_id(entidad);
			if (origen == "DP") {
				req.session.datosPers = req.session.datosPers ? req.session.datosPers : req.cookies.datosPers;
				req.session.datosPers = {...req.session.datosPers, [entidad_id]: id};
				res.cookie("datosPers", req.session.datosPers, {maxAge: unDia});
			} else if (origen == "ED") {
				req.session.edicProd = req.session.edicProd ? req.session.edicProd : req.cookies.edicProd;
				req.session.edicProd = {...req.session.edicProd, [entidad_id]: id};
				res.cookie("edicProd", req.session.edicProd, {maxAge: unDia});
			}
		} else if (codigo == "/rclv/edicion/") {
			// Obtiene el registro original
			let id = req.query.id;
			let RCLV_original = await BD_genericas.obtienePorIdConInclude(entidad, id, "status_registro");
			// Actualiza el registro o crea una edición
			RCLV_original.creado_por_id == userID && RCLV_original.status_registro.creado // ¿Registro propio en status creado?
				? await comp.actualizaRegistro(entidad, id, DE) // Actualiza el registro original
				: await comp.guardaEdicion(entidad, "rclvs_edicion", RCLV_original, DE, userID); // Guarda la edición
		} else if (codigo == "/revision/rclv/alta/") {
			// Obtiene el registro original
			let id = req.query.id;
			// Actualiza el registro o crea una edición
			await comp.actualizaRegistro(entidad, id, DE); // Actualizar el registro original
		}
		// Borrar session y cookies de RCLV
		if (req.session[entidad]) delete req.session[entidad];
		if (req.cookies[entidad]) res.clearCookie(entidad);
		// Fin
		return;
	},
	rutaSalir: (codigo, datos) => {
		// Variables
		let rutaSalir;
		// Obtiene la ruta
		if (codigo == "agregar") {
			// Desde vista 'agregar' no hace falta inactivar => vuelve al origen
			let rutaOrigen =
				datos.origen == "DP"
					? "/producto/agregar/datos-personalizados"
					: datos.origen == "ED"
					? "/producto/edicion/"
					: "/";
			let entidadIdOrigen =
				datos.origen && datos.origen != "DP"
					? "?entidad=" + datos.prodEntidad + "&id=" + datos.prodID
					: "";
			rutaSalir = rutaOrigen + entidadIdOrigen;
		} else {
			// Desde vista distinta a 'agregar' hace falta inactivar
			// La vista actual puede ser '/rclv/edicion' o '/revisar/rclv/alta'
			let entidadIdActual = "?entidad=" + datos.entidad + "&id=" + datos.id;
			let entidadIdOrigen =
				datos.origen && datos.origen != "DP"
					? "&prodEntidad=" + datos.prodEntidad + "&prodID=" + datos.prodID
					: ""; // Sería para '/revision/tablero' y '/producto/agregar/DP'
			let origen = "&origen=" + (!datos.origen ? "tableroEnts" : datos.origen);
			// rutaSalir
			rutaSalir = "/inactivar-captura/" + entidadIdActual + entidadIdOrigen + origen;
		}
		// Fin
		return rutaSalir;
	},
	personajes: {
		ano: (datos) => {
			// Variables
			let {dato} = datos;
			let cnt = {},
				ama = {};

			// Resultados
			if (dato != "") {
				dato = Number(dato);
				// Contemporáneos de Jesús
				cnt.certeza = dato >= 0; // Si el año es mayor o igual a cero, hay certeza sobre el resultado
				if (cnt.certeza) cnt.dato = dato <= 33; // Si hay certeza, en función del valor del año, el resultado es true o false

				// Aparición Mariana
				ama.certeza = dato < 1100; // Si el año es menor o igual a 1100, hay certeza sobre el resultado
				if (ama.certeza) ama.dato = false; // Si hay certeza sobre el resultado, el resultado es false
			} else cnt.certeza = ama.certeza = false;

			// Fin
			return {cnt, ama};
		},
	},
	hechos: {
		ano: (datos) => {
			// Variables
			let {dato} = datos;
			let jss = {},
				cnt = {},
				ncn = {},
				ama = {};

			// Resultados
			if (dato != "") {
				dato = Number(dato);
				// Jesús
				jss.certeza = dato >= 0; // Si el año es mayor o igual a cero, hay certeza sobre el resultado
				if (jss.certeza) jss.dato = dato <= 33; // Si hay certeza, en función del valor del año, el resultado es true o false

				// Contemporáneos de Jesús
				cnt.certeza = dato >= 0; // Si el año es mayor o igual a cero, hay certeza sobre el resultado
				if (cnt.certeza) cnt.dato = dato <= 100; // Si hay certeza, en función del valor del año, el resultado es true o false

				// También ocurrió fuera de la vida de los apóstoles
				ncn.certeza = dato < 0 || dato > 100; // Si el año es mayor o igual a cero, hay certeza sobre el resultado
				if (ncn.certeza) ncn.dato = true; // Si hay certeza sobre el resultado, el resultado es true

				// Aparición Mariana
				ama.certeza = dato < 1100; // Si el año es menor o igual a 1100, hay certeza sobre el resultado
				if (ama.certeza) ama.dato = false; // Sabemos que en ese caso el resultado es false
			} else jss.certeza = cnt.certeza = ncn.certeza = ama.certeza = false;

			// Fin
			return {jss, cnt, ncn, ama};
		},
		jss: (datos) => {
			// Variables
			let {dato} = datos;
			let cnt = {},
				ama = {};

			// Resultados
			if (dato == "1") {
				// Contemporáneos de Jesús
				cnt.certeza = true; // Si 'jss' es true, hay certeza de que 'cnt' es true
				cnt.dato = true; // Si 'jss' es true, 'cnt' es true también

				// Aparición Mariana
				ama.certeza = true; // Si 'jss' es true, hay certeza de que 'ama' es false
				ama.dato = false; // Si 'jss' es true, 'ama' es false
			} else cnt.certeza = ama.certeza = false;

			// Fin
			return {cnt, ama};
		},
	},
};
