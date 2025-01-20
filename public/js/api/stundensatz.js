export default {
	getStundensaetze: function(uid) {
		var url = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
                        + '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/getStundensaetze/' + uid;

		return axios.get(url);
	},
	deleteStundensatz: function(stundensatz_id) {
		var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
                        + '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/deleteStundensatz';
		return axios.post(url, {stundensatz_id: stundensatz_id}, {
			headers: {
				'Content-Type': 'application/json'
			}
		});
	},
	updateStundensatz: function(stundensatz_id) {
		var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
                        + '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/updateStundensatz';
		return axios.post(url, stundensatz_id, {
			headers: {
				'Content-Type': 'application/json'
			}
		});
	},
};
