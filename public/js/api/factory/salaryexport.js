export default {
	getAll(listType, orgID, filterPerson, filterDate, exportCSV) {
		let url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/SalaryExport/getAll';

		if (filterDate == null) return {
			method: 'get',
			url,			
		}

		return {
			method: 'get',
			url,
			params: { 
			  von: filterDate[0], 
			  bis: filterDate[1], 
			  export: !!exportCSV, 
			  listType: listType,
			  orgID: orgID,
			  filterPerson: !filterPerson ? '' :filterPerson 
			}
		}
	},
	abrechnungExists(date, orgID) {
		return {
			method: 'get',
			url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/SalaryExport/existsAnyGehaltshistorie',  
			params: {date, orgID} 
		}
	},
	runAbrechnungJob(date) {
		return {
			method: 'get',
			url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/SalaryExport/runGehaltshistorieJob',  
			params: {date, orgID} 
		}
	},
	deleteAbrechnung: function(date, orgID) {
		return {
			method: 'post',
			url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/SalaryExport/deleteGehaltshistorie',  
			params: {date, orgID} 
		}
	},
	
};
