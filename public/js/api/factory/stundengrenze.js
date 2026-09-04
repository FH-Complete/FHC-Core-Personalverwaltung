export default {
	getStundengrenzen(mitarbeiter_uid) {
		return {
			method: 'get',
			url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/getStundengrenzen',
			params: { mitarbeiter_uid: mitarbeiter_uid}
		}
	},
	deleteStundengrenze(stundengrenze_id) {		
		return {
			method: 'post',
			url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/deleteStundengrenze',
			params: { stundengrenze_id }
		}
	},
	updateStundengrenze(payload) {
		return {
			method: 'post',
			url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/updateStundengrenze',
			params: payload
		}
	},
	getStudiensemester() {
		return {
			method: 'get',
			url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getStudiensemester'
		}
	},
	getOrgets: function() {
		return {
			method: 'get',
			url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/OrgAPI/getOrgetsWithStundengrenzen'
		}
	},
	getStundengrenzeDefaults(mitarbeiter_uid, oe_kurzbz) {
		return {
			method: 'get',
			url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/getStundengrenzeDefaults',
			params: { mitarbeiter_uid: mitarbeiter_uid, oe_kurzbz: oe_kurzbz}
		}
	}
};
