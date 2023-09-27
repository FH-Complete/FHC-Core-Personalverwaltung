export default {
	getStundensaetze: function(uid) {
		var url = FHC_JS_DATA_STORAGE_OBJECT.app_root + 'index.ci.php/extensions/FHC-Core-Personalverwaltung/api/getStundensaetze/' + uid;

		return axios.get(url);
	},
	deleteStundensatz: function(stundensatz_id) {
		var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router + '/extensions/FHC-Core-Personalverwaltung/api/deleteStundensatz';
		return axios.post(url, {stundensatz_id: stundensatz_id}, {
			headers: {
				'Content-Type': 'application/json'
			}
		});
	},
	updateStundensatz: function(stundensatz_id) {
		var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router + '/extensions/FHC-Core-Personalverwaltung/api/updateStundensatz';
		return axios.post(url, stundensatz_id, {
			headers: {
				'Content-Type': 'application/json'
			}
		});
	},
};
