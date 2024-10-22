export default {
  getUnternehmen: function() {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/OrgAPI/getUnternehmen';
    return axios.get(url);
  },
  getVertragsarten: function() {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getVertragsarten';
    return axios.get(url);
  },
  getDVByID: function(dvid) {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/dvByID/' + dvid;
    return axios.get(url);
  },
  endDV: function(payload) {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/endDV';
    return axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },
  deactivateDV: function(payload) {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/deactivateDV';
    return axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },
  getDvEndeGruende: function() {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/getDvEndeGruende';
    return axios.get(url);
  }
};
