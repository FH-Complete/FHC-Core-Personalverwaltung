export default {

    personAbwesenheiten: function(uid) {
        let url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
                + '/extensions/FHC-Core-Personalverwaltung/api/offTimeByPerson';
        return axios.get(url, { params: { uid: uid} });
    },

}  