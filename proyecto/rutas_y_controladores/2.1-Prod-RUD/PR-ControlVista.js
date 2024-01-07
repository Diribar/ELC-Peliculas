"use strict";
// Variables
const procsCRUD = require("../2.0-Familias-CRUD/FM-Procesos");
const procsRCLV = require("../2.2-RCLVs-CRUD/RCLV-FN-Procesos");
const procesos = require("./PR-FN-Procesos");
const valida = require("./PR-FN-Validar");

// *********** Controlador ***********
module.exports = {
	detalle: async (req, res) => {
		// Variables
		const tema = "prodRud";
		const codigo = "detalle";
		const {entidad, id} = req.query;
		const origen = req.query.origen;
		const usuario = req.session.usuario ? req.session.usuario : null;
		const userID = usuario ? usuario.id : "";
		const autTablEnts = usuario ? usuario.rolUsuario.autTablEnts : false;
		const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad);

		// Obtiene el producto 'Original' y 'Editado'
		const [original, edicion] = await procsCRUD.obtieneOriginalEdicion(entidad, id, userID);
		const prodComb = {...original, ...edicion, id}; // obtiene la versión más completa posible del producto

		// Configura el título de la vista
		const nombre = prodComb.nombreCastellano ? prodComb.nombreCastellano : prodComb.nombreOriginal;
		const tituloDetalle = "Detalle de " + entidadNombre;
		const titulo = entidadNombre + " - " + nombre;

		// Info para el bloque Izquierdo
		const {infoGral, actores} = procesos.bloqueIzq(prodComb);
		const bloqueIzq = {infoGral, actores};

		// RCLV
		const entidadesRCLV = variables.entidades.rclvs;
		const RCLVs = entidadesRCLV.map((n) => ({
			entidad: n,
			campo_id: comp.obtieneDesdeEntidad.campo_id(n),
			asociacion: comp.obtieneDesdeEntidad.asociacion(n),
		}));
		const rclvs_id = variables.entidades.rclvs_id;
		const asocs = variables.asocs.rclvs;
		for (let i = 0; i < asocs.length; i++)
			if (prodComb[rclvs_id[i]] != 1)
				bloqueIzq[asocs[i]] = procsRCLV.detalle.bloqueRCLV({entidad: entidadesRCLV[i], ...prodComb[asocs[i]]});
		const rclvsNombre = variables.entidades.rclvsNombre;

		// Info para el bloque Derecho
		const bloqueDer = procsCRUD.bloqueRegistro({...prodComb, entidad});
		const imgDerPers = procsCRUD.obtieneAvatar(original, edicion).edic;

		// Lecturas de BD
		if (entidad == "capitulos")
			prodComb.capitulos = BD_especificas.obtieneCapitulos(prodComb.coleccion_id, prodComb.temporada);
		let links = procesos.obtieneLinksDelProducto({entidad, id, userID, autTablEnts});
		let interesDelUsuario = userID ? procesos.obtieneInteresDelUsuario({usuario_id: userID, entidad, entidad_id: id}) : "";
		let yaCalificada = userID
			? BD_genericas.obtienePorCondicion("calRegistros", {usuario_id: userID, entidad, entidad_id: id}).then((n) => !!n)
			: "";
		[prodComb.capitulos, links, interesDelUsuario, yaCalificada] = await Promise.all([
			prodComb.capitulos,
			links,
			interesDelUsuario,
			yaCalificada,
		]);

		// Obtiene datos para la vista
		const status_id = original.statusRegistro_id;
		const userPerenne = usuario && usuario.statusRegistro_id == perennes_id;
		const creadoPor_id = prodComb.creadoPor_id;
		const ayudasTitulo = links.PL.length
			? ["Eligiendo " + (links.PL.length == 1 ? "el link" : "uno de los links") + ", podés ver la película"]
			: ["No tenemos links de la película.", "Estás invitado a aportarnos alguno."];

		// Va a la vista
		return res.render("CMP-0Estructura", {
			...{tema, codigo, tituloDetalle, titulo, ayudasTitulo, origen, userPerenne},
			...{entidad, id, familia: "producto", status_id, creadoPor_id},
			...{entidadNombre, registro: prodComb, links, interesDelUsuario, yaCalificada},
			...{imgDerPers, tituloImgDerPers: prodComb.nombreCastellano},
			...{bloqueIzq, bloqueDer, RCLVs, asocs, rclvsNombre},
		});
	},
	edicion: {
		form: async (req, res) => {
			// Tema y Código
			const tema = "prodRud";
			const codigo = "edicion";

			// Más variables
			const {entidad, id} = req.query;
			const origen = req.query.origen;
			const userID = req.session.usuario ? req.session.usuario.id : "";
			const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad);
			let imgDerPers, gruposPers, gruposHechos;
			let camposInput1, camposInput2, produccion, camposDA, paisesTop5;

			// Configura el título de la vista
			const titulo =
				(codigo == "detalle" ? "Detalle" : codigo == "edicion" ? "Edición" : "") +
				" de" +
				(entidad == "capitulos" ? " un " : " la ") +
				entidadNombre;

			// Obtiene la versión más completa posible del producto
			const [original, edicion] = await procsCRUD.obtieneOriginalEdicion(entidad, id, userID);
			let prodComb = {...original, ...edicion, id};
			if (req.session.edicProd) prodComb = {...prodComb, ...req.session.edicProd};
			delete req.session.edicProd;

			// Obtiene el nombre de los países
			const paisesNombre = original.paises_id ? comp.paises_idToNombre(original.paises_id) : "";

			// Obtiene los datos de session/cookie y luego los elimina
			let edicSession;
			// Session
			if (req.session.edicProd)
				req.session.edicProd.entidad == entidad && req.session.edicProd.id == id
					? (edicSession = req.session.edicProd)
					: delete req.session.edicProd;

			// Cookies
			if (req.cookies.edicProd && !edicSession)
				req.cookies.edicProd.entidad == entidad && req.cookies.edicProd.id == id
					? (edicSession = req.cookies.edicProd)
					: res.clearCookie("edicProd");

			// Actualiza el producto prodComb
			prodComb = {...prodComb, ...edicSession};
			// Datos Duros - Campos Input
			let camposInput = variables.camposDD.filter((n) => n[entidad] || n.productos).filter((n) => n.campoInput);
			camposInput1 = camposInput.filter((n) => n.antesDePais);
			camposInput2 = camposInput.filter((n) => !n.antesDePais && n.nombre != "produccion");
			produccion = camposInput.find((n) => n.nombre == "produccion");
			// Datos Duros - Bases de Datos
			paisesTop5 = paises.sort((a, b) => b.cantProds - a.cantProds).slice(0, 5);
			// Datos Duros - Avatar
			imgDerPers = procsCRUD.obtieneAvatar(original, {...edicion, ...edicSession});

			// Datos Personalizados
			camposDA = await variables.camposDA_conValores(userID);
			gruposPers = procsCRUD.grupos.pers(camposDA);
			gruposHechos = procsCRUD.grupos.hechos(camposDA);

			// Obtiene datos para la vista
			if (entidad == "capitulos")
				prodComb.capitulos = await BD_especificas.obtieneCapitulos(prodComb.coleccion_id, prodComb.temporada);
			const ayudasTitulo = [
				"Los íconos de la barra azul de más abajo, te permiten editar los datos de esta vista y crear/editar los links.",
			];
			const status_id = original.statusRegistro_id;

			// Va a la vista
			// return res.send(prodComb)
			return res.render("CMP-0Estructura", {
				...{tema, codigo, titulo, ayudasTitulo, origen},
				...{entidadNombre, entidad, id, familia: "producto", registro: prodComb},
				...{imgDerPers, status_id},
				...{camposInput1, camposInput2, produccion},
				...{paises, paisesTop5, idiomas, paisesNombre, camposDA, gruposPers, gruposHechos},
				...{omitirImagenDerecha: true, omitirFooter: true, cartelGenerico: true},
			});
		},
		guardar: async (req, res) => {
			// Variables
			const {entidad, id, origen} = req.query;
			const userID = req.session.usuario.id;
			const revisorPERL = req.session.usuario && req.session.usuario.rolUsuario.revisorPERL;
			const entidadIdOrigen = "?entidad=" + entidad + "&id=" + id + (origen ? "&origen=" + origen : "");

			// Elimina los campos vacíos y pule los espacios innecesarios
			for (let campo in req.body) if (!req.body[campo]) req.body[campo] = null;
			for (let campo in req.body) if (typeof req.body[campo] == "string") req.body[campo] = req.body[campo].trim();

			// Si recibimos un avatar, se completa la información
			if (req.file) {
				req.body.avatar = req.file.filename;
				req.body.avatarUrl = req.file.originalname;
				req.body.tamano = req.file.size;
			}

			// Obtiene el producto 'Original' y 'Editado'
			let [original, edicion] = await procsCRUD.obtieneOriginalEdicion(entidad, id, userID, true);
			const avatarEdicInicial = edicion.avatar;
			if (original.capitulos) delete original.capitulos;

			// Averigua si corresponde actualizar el original
			const actualizaOrig =
				revisorPERL && // 1. Tiene que ser un revisorPERL
				original.statusRegistro_id == creadoAprob_id; // 2. El registro debe estar en el status 'creadoAprob'

			// Averigua si hay errores de validación
			// 1. Se debe agregar el id del original, para verificar que el registro no está repetido
			// 2. Se debe agregar la edición, para que aporte su campo 'avatar'
			let prodComb = {...original, ...edicion, ...req.body, id};
			prodComb.epocaOcurrencia = revisorPERL; // si es un revisorPERL, agrega la obligatoriedad de que haya completado los campos 'epocaOcurrencia_id' y 'publico_id'
			prodComb.publico = revisorPERL;
			const errores = await valida.consolidado({datos: {...prodComb, entidad}});

			// Acciones si no hay errores sensibles
			if (!errores.sensible) {
				// Acciones si corresponde actualizar el original
				if (actualizaOrig) {
					// Completa los datos a guardar
					prodComb.altaRevisadaPor_id = userID;
					prodComb.altaRevisadaEn = comp.fechaHora.ahora();

					// Actualiza el registro original
					await BD_genericas.actualizaPorId(entidad, id, prodComb);

					// Actualiza los campos de los capítulos de una colección
					if (entidad == "colecciones") {
						// Variables
						let esperar = [];

						// Rutina por campo - sin 'await' y solo para los campos editados
						for (let campo in req.body)
							if (original[campo] != req.body[campo])
								esperar.push(procsCRUD.revisiones.transfiereDatos(original, req.body, campo));

						// Espera a que se corran todos los campos
						await Promise.all(esperar);
					}

					// Elimina otras ediciones que tengan los mismos valores
					let edicsEliminadas = procsCRUD.revisiones.eliminaDemasEdiciones({entidad, original: prodComb, id});

					// Se fija si corresponde cambiar el status
					let statusAprob = procsCRUD.revisiones.statusAprob({entidad, registro: prodComb});

					// Espera a que se completen las funciones con 'Promise'
					[statusAprob, edicsEliminadas] = await Promise.all([statusAprob, edicsEliminadas]);

					// Limpia el valor de la edicion, para que no se recargue el url
					edicion = null;
				}
				// De lo contrario, actualiza la edicion
				else {
					// Combina la información
					edicion = {...edicion, ...req.body};
					// Guarda o actualiza la edición, y achica 'edición a su mínima expresión
					edicion = await procsCRUD.guardaActEdicCRUD({original, edicion, entidad, userID});
				}

				// Acciones sobre el archivo avatar, si recibimos uno
				if (req.file) {
					if (actualizaOrig) {
						// Mueve el archivo de la edición para reemplazar el original
						comp.gestionArchivos.mueveImagen(prodComb.avatar, "9-Provisorio", "2-Productos/Final");
						// Elimina el anterior archivo de imagen original
						if (original.avatar) comp.gestionArchivos.elimina(carpetaExterna + "2-Productos/Final/", original.avatar);
					} else {
						// Mueve el archivo de la edición para su revisión
						comp.gestionArchivos.mueveImagen(prodComb.avatar, "9-Provisorio", "2-Productos/Revisar");
						// Elimina el anterior archivo de imagen editada
						if (avatarEdicInicial)
							comp.gestionArchivos.elimina(carpetaExterna + "2-Productos/Revisar/", avatarEdicInicial);
					}
				}

				// Elimina los datos de la session
				delete req.session.edicProd;
			} else {
				// Si recibimos un archivo avatar editado, lo elimina
				if (req.file) comp.gestionArchivos.elimina(carpetaExterna + "9-Provisorio/", req.file.filename);

				// Guarda los datos editados, sin el de avatar
				req.session.edicProd = req.body;
				delete req.session.edicProd.avatar;

				// Recarga la vista
				return res.redirect(req.originalUrl);
			}

			// Fin
			return edicion
				? res.redirect(req.originalUrl) // Recarga la vista
				: origen == "TR"
				? res.redirect("/inactivar-captura/" + entidadIdOrigen) // Regresa a Revisión
				: res.redirect(req.baseUrl + req.path + entidadIdOrigen); // Recarga la vista sin la edición
		},
	},
	califica: {
		form: async (req, res) => {
			// Variables
			const tema = "prodRud";
			const codigo = "calificar";
			const {entidad, id} = req.query;
			const origen = req.query.origen; // ? req.query.origen : "CAL";
			const userID = req.session.usuario ? req.session.usuario.id : "";
			const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad);

			// Obtiene la versión más completa posible del producto
			const [original, edicion] = await procsCRUD.obtieneOriginalEdicion(entidad, id, userID);
			let prodComb = {...original, ...edicion, id};

			// Info para el bloque Derecho
			const bloqueDer = procsCRUD.bloqueRegistro({...prodComb, entidad});
			const imgDerPers = procsCRUD.obtieneAvatar(original, edicion).edic;

			// Info para la vista
			if (entidad == "capitulos")
				prodComb.capitulos = await BD_especificas.obtieneCapitulos(prodComb.coleccion_id, prodComb.temporada);
			const titulo = "Calificá " + (entidad == "capitulos" ? "un " : "la ") + entidadNombre;
			const status_id = original.statusRegistro_id;
			const atributosTitulo = ["Deja Huella", "Entretiene", "Calidad Técnica"];
			const condics = {entidad, entidad_id: id, usuario_id: userID};
			const include = ["feValores", "entretiene", "calidadTecnica"];
			const califUsuario = await BD_genericas.obtienePorCondicionConInclude("calRegistros", condics, include);
			const interesDelUsuario = await procesos.obtieneInteresDelUsuario({usuario_id: userID, entidad, entidad_id: id});

			// Ayuda para el título
			const ayudasTitulo = [];
			if ([sinPref.id, laQuieroVer.id].includes(interesDelUsuario.id))
				ayudasTitulo.push("Sólo podés calificar una película si ya la viste.");
			if (interesDelUsuario.id == sinPref.id) ayudasTitulo.push("Cambiaremos tu preferencia como 'Ya vista'");
			ayudasTitulo.push("Necesitamos saber TU opinión, no la de otras personas.");

			// Va a la vista
			return res.render("CMP-0Estructura", {
				...{tema, codigo, titulo, ayudasTitulo, origen},
				...{entidad, id, familia: "producto", status_id},
				...{entidadNombre, registro: prodComb, interesDelUsuario},
				...{imgDerPers, tituloImgDerPers: prodComb.nombreCastellano},
				...{bloqueDer, atributosTitulo, califUsuario},
			});
		},
		guardar: async (req, res) => {
			// Variables
			const {entidad, id: entidad_id, feValores_id, entretiene_id, calidadTecnica_id} = {...req.query, ...req.body};
			const userID = req.session.usuario.id;
			let condics;

			// Verifica errores
			const errores = valida.calificar({feValores_id, entretiene_id, calidadTecnica_id});
			if (errores.hay) return res.redirect(req.originalUrl);

			// Obtiene el resultado
			const valores = {usuario_id: userID, entidad, entidad_id, feValores_id, entretiene_id, calidadTecnica_id};
			let resultado = 0;
			for (let criterio of criteriosCalif) {
				const campo_id = criterio.atributo_id;
				const campo = criterio.atributo;
				const ponderacion = criterio.ponderacion;
				const ID = valores[campo_id];
				const atributoCalif = atributosCalific[campo].find((n) => n.id == ID);
				const valor = atributoCalif.valor;
				resultado += (valor * ponderacion) / 100;
			}
			valores.resultado = Math.round(resultado);

			// Averigua si existe la calificacion
			condics = {usuario_id: userID, entidad, entidad_id};
			const existe = await BD_genericas.obtienePorCondicion("calRegistros", condics);
			existe
				? await BD_genericas.actualizaPorId("calRegistros", existe.id, valores)
				: await BD_genericas.agregaRegistro("calRegistros", valores);

			// Actualiza las calificaciones del producto
			await procesos.actualizaCalifProd({entidad, entidad_id});

			// Actualiza la ppp
			condics = {usuario_id: userID, entidad, entidad_id};
			const interesDelUsuario = await BD_genericas.obtienePorCondicion("pppRegistros", condics);
			const novedades = {usuario_id: userID, entidad, entidad_id, opcion_id: yaLaVi.id};
			interesDelUsuario
				? await BD_genericas.actualizaPorId("pppRegistros", interesDelUsuario.id, novedades)
				: await BD_genericas.agregaRegistro("pppRegistros", novedades);

			// Fin
			return res.redirect(req.originalUrl);
		},
	},
};
