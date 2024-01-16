export default {
  getUnternehmen: function() {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/Api/getUnternehmen';
    return axios.get(url);
  },
  getVertragsarten: function() {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/Api/getVertragsarten';
    return axios.get(url);
  },
  getDVByID: function(dvid) {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/Api/dvByID/' + dvid;
    return axios.get(url);
  },
  endDV: function(payload) {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/Api/endDV';
    return axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }  
};
