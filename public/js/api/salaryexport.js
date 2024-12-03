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
	abrechnungExists: function(date) {
		let url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/SalaryExport/existsAnyGehaltshistorie';
		return this.$fhcApi.get(url, {date} );
	},
	runAbrechnungJob: function(date) {
		let url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/SalaryExport/runGehaltshistorieJob';
		return axios.get(url, { params: {date} });
	},
	
};
