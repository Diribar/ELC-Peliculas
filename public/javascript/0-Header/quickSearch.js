window.addEventListener("load", () => {
	quickSearch = document.querySelector("#busquedaRapida input");
	teclasValidas = /^[a-z áéíóúüñ\d]+$/;

	quickSearch.addEventListener("keydown", (e) => {
		if (!teclasValidas.test(e.key.toLowerCase()) || e.key == "Dead") e.preventDefault();
	});
	quickSearch.addEventListener("input", async () => {
		// Quita todos los caracteres que no sean válidos
		quickSearch.value = quickSearch.value
			.replace(/[^a-záéíóúüñ\d\s]/gi, "")
			.replace(/ +/g, " ");
		dataEntry = quickSearch.value;

		// Termina el proceso si la palabra tiene menos de 4 caracteres
		if (dataEntry.length < 4) return;

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
		aux=await fetch("/quick-search/?palabras=" + palabras).then((n) => n.json());
		console.log(aux)
	});
});
