export default {
    getGemeinden: function(plz) {
        var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router
                + '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getGemeinden';
        return axios.get(url, { params: { plz: plz} });
    },
    getOrtschaften: function(plz) {
        var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router
                + '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getOrtschaften';
        return axios.get(url, { params: { plz: plz} });
    },
    getContractExpire: function(year, month) {
        var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router
                + '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getContractExpire';
        return axios.get(url, { params: { year: year, month: month} });
    },
    getContractNew: function(year, month) {
      var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router
              + '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getContractNew';
      return axios.get(url, { params: { year: year, month: month} });
    },
    getBirthdays: function(date) {
      var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router
              + '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getBirthdays';
      return axios.get(url, { params: { date: date} });
    },
    getCovidState: function(person_id, date) {
      var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router
              + '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getCovidState';
      return axios.get(url, { params: { person_id: person_id, d: date} });
    }
}    