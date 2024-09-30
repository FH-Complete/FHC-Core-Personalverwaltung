export default {

    personAbwesenheiten: function(uid) {
        let url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
                + '/extensions/FHC-Core-Personalverwaltung/api/v1/PersonAPI/offTimeByPerson';
        return axios.get(url, { params: { uid: uid} });
    },
    personAbwesenheitenByYear: function(uid, year) {
        let url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
                + '/extensions/FHC-Core-Personalverwaltung/api/v1/PersonAPI/offTimeByPerson';
        return axios.get(url, { params: { uid: uid, year: year } });
    },
    personZeiterfassungByWeek: function(uid, year, week) {
        let url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
                + '/extensions/FHC-Core-Personalverwaltung/api/v1/PersonAPI/timeRecordingByPerson';
        return axios.get(url, { params: { uid, year, week } });
    },

}  