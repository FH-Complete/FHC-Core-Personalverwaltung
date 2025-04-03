export default {
	getAll: function(filterDate) {
		let url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/SalaryRange/getAll';
		if (filterDate == null) return this.$fhcApi.get(url);
		//return axios.get(url, { params: { von: filterDate[0], bis: filterDate[1] } });
		return this.$fhcApi.get(url, { von: filterDate[0], bis: filterDate[1] } );

	},
	getSalaryRangeList: function(uid) {
		let url = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
                + '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/SalaryRange/getSalaryRangeList';
		return this.$fhcApi.get(url);
	},
	deleteSalaryRange: function(id) {
		let url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
                + `/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/SalaryRange/deleteBetrag/${id}`;
		return this.$fhcApi.post(url);
	},
	upsertSalaryRange: function(payload) {
		let url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
				+ `/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/SalaryRange/upsertBetrag`;
		return this.$fhcApi.post(url, payload, {
			headers: {
				'Content-Type': 'application/json'
			}
		});
	},
	
};
