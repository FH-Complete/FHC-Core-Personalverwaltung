export default {

    getWeiterbildungkategorien() {
        return {
            method: 'get',
            url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/Weiterbildung/getWeiterbildungskategorienList',   
            
        }
    },
    getKategorieTypen() {
        return {
            method: 'get',
            url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/Weiterbildung/getWeiterbildungskategorietypList',
        }
    },
    getAllByUID(uid) {
        return {
            method: 'get',
            url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/Weiterbildung/getAllByUID',   
            params: { uid }   
        }
    },
    deleteTraining(id) {
		return {
			method: 'post',
			url: `/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/Weiterbildung/deleteWeiterbildung/${id}`,
		}
	},
	upsertTraining(payload) {
		return {
			method: 'post',
			url: `/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/Weiterbildung/upsertWeiterbildung`,
			params: payload,
		}
	},

}  