export default {
	getRateByOrget: function(filterDate, orgID, orgetID) {
		let url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/StaffTurnover/getRateByOrget';
		return this.$fhcApi.get(url, { von: filterDate[0], bis: filterDate[1], orgID, orgetID } );
	},		
};