export default {
	getOrgStructure: function(oe) {
		let url = `/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/OrgAPI/getOrgStructure?oe=${oe}`;
		return this.$fhcApi.get(url);
	},
	getOrgPersonen: function(oe) {
		const url = `/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/OrgAPI/getOrgPersonen?oe=${oe}`;
		return this.$fhcApi.get(url);
	},
};
