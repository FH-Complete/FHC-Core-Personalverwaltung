export default {
	getAll: function(listType, orgID, filterPerson, filterDate, exportCSV) {
		let url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/SalaryExport/getAll';

		if (filterDate == null) this.$fhcApi.get(url);

		if (!filterPerson) {
			filterPerson = '';
		}

		return this.$fhcApi.get(url,
			{ von: filterDate[0], 
			  bis: filterDate[1], 
			  export: !!exportCSV, 
			  listType: listType,
			  orgID: orgID,
			  filterPerson: filterPerson 
		});
	},
	/* getSalaryRangeList: function(uid) {
		let url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/SalaryExport/getSalaryExportList';
		return this.$fhcApi.get(url);
	}, */
	abrechnungExists: function(date, orgID) {
		let url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/SalaryExport/existsAnyGehaltshistorie';
		return this.$fhcApi.get(url, {date, orgID} );
	},
	runAbrechnungJob: function(date) {
		let url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/SalaryExport/runGehaltshistorieJob';
		return this.$fhcApi.get(url, {date, orgID}, {
			timeout: 60000
		} );
	},
	deleteAbrechnung: function(date, orgID) {
		let url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/SalaryExport/deleteGehaltshistorie';
		return this.$fhcApi.post(url, {date, orgID}, {
			timeout: 10000
		} );
	},
	
};
