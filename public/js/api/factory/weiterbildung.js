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
    loadDokumente(weiterbildung_id){
        return {
			method: 'post',
			url: `/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/Weiterbildung/loadDokumente/${weiterbildung_id}`,
		}
	},
    download(dms_id){
        return {
			method: 'get',
			url: `/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/Weiterbildung/downloadDoc/${dms_id}`,
		}
	},
    updateDokumente(weiterbildung_id, params) {
        return {
			method: 'post',
			url: `/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/Weiterbildung/updateDokumente/${weiterbildung_id}`,
            params
		}
    }

}  