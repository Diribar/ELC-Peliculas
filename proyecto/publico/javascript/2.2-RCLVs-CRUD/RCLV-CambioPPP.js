"use strict";
window.addEventListener("load", async () => {
	// Variables DOM
	const iconosPPP = document.querySelectorAll("#prodsNuevos #prod i");
	const anchors = document.querySelectorAll("#prodsNuevos a");

	// Variables varias
	const rutas = {
		obtieneVariables: "/rclv/api/detalle/obtiene-variables",
		pppRutaGuardar: "/producto/api/guarda-la-preferencia-del-usuario",
	};
	const v = await fetch(rutas.obtieneVariables).then((n) => n.json());
	console.log(v);
	let entidades = [];
	let ids = [];

	// Obtiene las entidades e ids
	for (let anchor of anchors) {
		entidades.push(new URL(anchor.href).searchParams.get("entidad"));
		ids.push(new URL(anchor.href).searchParams.get("id"));
	}

	// Funciones
	let cambiosEnPpp = async (indice) => {
		// Opción actual
		const pppActual = v.pppOpcsArray.find((n) => iconosPPP[indice].className.endsWith(n.icono));
		const pppActual_id = pppActual.id;

		// Opción propuesta
		const pppProp_id = pppActual_id > 1 ? pppActual_id - 1 : v.pppOpcsSimples.length;
		const pppProp = v.pppOpcsArray.find((n) => n.id == pppProp_id);

		// Actualiza el ícono y el título
		iconosPPP[indice].classList.remove(...pppActual.icono.split(" "));
		iconosPPP[indice].classList.add(...pppProp.icono.split(" "));
		iconosPPP[indice].title = pppProp.nombre;

		// Actualiza la preferencia
		iconosPPP[indice].classList.add("inactivo");
		await fetch(
			rutas.pppRutaGuardar + "/?entidad=" + entidades[indice] + "&entidad_id=" + ids[indice] + "&ppp_id=" + pppProp_id
		);
		iconosPPP[indice].classList.remove("inactivo");

		// Fin
		return;
	};

	// Eventos
	iconosPPP.forEach((iconoPPP, indice) => {
		iconoPPP.addEventListener("click", async (e) => {
			e.preventDefault(); // Previene el efecto del anchor
			if (!iconosPPP[indice].className.includes("inactivo")) cambiosEnPpp(indice);
			return;
		});
	});
});
