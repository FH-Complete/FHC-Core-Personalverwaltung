export default {
	getStundensaetze: function(uid) {
		var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/getStundensaetze/' + uid;

		return this.$fhcApi.get(url);
	},
	deleteStundensatz: function(stundensatz_id) {
		var url =  '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/deleteStundensatz';
		return this.$fhcApi.post(url, {stundensatz_id: stundensatz_id}, {
			headers: {
				'Content-Type': 'application/json'
			}
		});
	},
	updateStundensatz: function(stundensatz_id) {
		var url =  '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/updateStundensatz';
		return this.$fhcApi.post(url, stundensatz_id, {
			headers: {
				'Content-Type': 'application/json'
			}
		});
	},
};
