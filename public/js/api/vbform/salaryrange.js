export default {
	getAll: function(uid) {
		var url = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
                + '/extensions/FHC-Core-Personalverwaltung/apis/SalaryRange/getAll';
		return axios.get(url);
	},
	getSalaryRangeList: function(uid) {
		var url = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
                + '/extensions/FHC-Core-Personalverwaltung/apis/SalaryRange/getSalaryRangeList';
		return axios.get(url);
	},
	deleteSalaryRange: function(id) {
		var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
                + `/extensions/FHC-Core-Personalverwaltung/apis/SalaryRange/deleteBetrag/${id}`;
		return axios.post(url);
	},
	upsertSalaryRange: function(payload) {
		var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
				+ `/extensions/FHC-Core-Personalverwaltung/apis/SalaryRange/upsertBetrag`;
		return axios.post(url, payload, {
			headers: {
				'Content-Type': 'application/json'
			}
		});
	},
	
};
