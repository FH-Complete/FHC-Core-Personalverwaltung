export default {
	getOrgStructure(oe) {
		return {
			method: 'get',
			url: `/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/OrgAPI/getOrgStructure?oe=${oe}`,      
		}
	},
	getOrgPersonen(oe) {
		return {
			method: 'get',
			url: `/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/OrgAPI/getOrgPersonen?oe=${oe}`,      
		}
	},
	getOrgHeads() {
		return {
			method: 'get',
			url: 'extensions/FHC-Core-Personalverwaltung/api/frontend/v1/OrgAPI/getOrgHeads'
		}
	}
};
