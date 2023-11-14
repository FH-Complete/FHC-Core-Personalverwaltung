export default {
  getKarenztypen: function() {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/Api/getKarenztypen';
    return axios.get(url);
  },
  saveKarenz: function(payload) {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/Api/saveKarenz';
    return axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }  
};
