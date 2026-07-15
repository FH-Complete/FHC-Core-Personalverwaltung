export default {
	getStundensaetze(uid) {
		return {
			method: 'post',
			url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/getStundensaetze/' + uid,
			params: uid
		}
	},
	deleteStundensatz(stundensatz_id) {		
		return {
			method: 'post',
			url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/deleteStundensatz',
			params: { stundensatz_id }
		}
	},
	updateStundensatz(payload) {
		return {
			method: 'post',
			url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/updateStundensatz',
			params: payload
		}
	},
};
