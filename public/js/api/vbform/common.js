export default {   

    getGemeinden: function(plz) {
      var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router + '/extensions/FHC-Core-Personalverwaltung/api/getGemeinden';
      return axios.get(url, { params: { plz: plz} });
    },
    getOrtschaften: function(plz) {
      var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router + '/extensions/FHC-Core-Personalverwaltung/api/getOrtschaften';
      return axios.get(url, { params: { plz: plz} });
    }    
}    