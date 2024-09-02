export default {   

    getGemeinden: function(plz) {
      var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
              + '/extensions/FHC-Core-Personalverwaltung/apis/v1/CommonsAPI/getGemeinden';
      return axios.get(url, { params: { plz: plz} });
    },
    getOrtschaften: function(plz) {
      var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
              + '/extensions/FHC-Core-Personalverwaltung/apis/v1/CommonsAPI/getOrtschaften';
      return axios.get(url, { params: { plz: plz} });
    }    
}    