export default {
  getContractFunctions: function(filter) {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/api/v1/FunctionsAPI/getContractFunctions';
    if( typeof filter !== 'undefined' && filter !== null ) {
        url = url + '/' + filter;
    }
    return axios.get(url);
  },
  getOrgetsForCompany: function(unternehmen) {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/api/v1/OrgAPI/getOrgetsForCompany'
            + '/' + unternehmen;
    return axios.get(url);
  },
  getCompanyByOrget: function(orget) {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/api/v1/OrgAPI/getCompanyByOrget'
            + '/' + orget;
    return axios.get(url);
  },
  getCurrentFunctions: function(mitarbeiter_uid, unternehmen) {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/api/v1/FunctionsAPI/getCurrentFunctions'
            + '/' + mitarbeiter_uid + '/' + unternehmen;
    return axios.get(url);
  }  ,
  getAllUserFunctions: function(mitarbeiter_uid) {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/api/v1/FunctionsAPI/getAllUserFunctions'
            + '/' + mitarbeiter_uid;
    return axios.get(url);
  },
  getAllFunctions: function() {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/api/v1/FunctionsAPI/getAllFunctions';
    return axios.get(url);
  }
};
