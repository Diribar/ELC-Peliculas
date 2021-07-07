const details_Heroku = require("../../modelos/API/2-details-FA (Heroku)");
//const search_FA_Rapid = require("../API/1-search-FA-Rapid");

module.exports = {
	detail: async (ID) => {
		lectura = await details_Heroku(ID);
		return lectura;
	},
};
