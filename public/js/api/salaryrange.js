export default {
	getAll: function(filterDate) {
		var url = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
                + '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/SalaryRange/getAll';
		if (filterDate == null) return axios.get(url);
		return axios.get(url, { params: { von: filterDate[0], bis: filterDate[1] } });

	},
	getSalaryRangeList: function(uid) {
		var url = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
                + '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/SalaryRange/getSalaryRangeList';
		return axios.get(url);
	},
	deleteSalaryRange: function(id) {
		var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
                + `/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/SalaryRange/deleteBetrag/${id}`;
		return axios.post(url);
	},
	upsertSalaryRange: function(payload) {
		var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
				+ `/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/SalaryRange/upsertBetrag`;
		return axios.post(url, payload, {
			headers: {
				'Content-Type': 'application/json'
			}
		});
	},
	
};
