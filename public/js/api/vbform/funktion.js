export default {
  getContractFunctions: function() {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root 
            + 'index.ci.php/extensions/FHC-Core-Personalverwaltung/Api/getContractFunctions';
    return axios.get(url);
  },
  getOrgetsForCompany: function(unternehmen) {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root 
            + 'index.ci.php/extensions/FHC-Core-Personalverwaltung/Api/getOrgetsForCompany'
            + '/' + unternehmen;
    return axios.get(url);
  },
  getCompanyByOrget: function(orget) {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root 
            + 'index.ci.php/extensions/FHC-Core-Personalverwaltung/Api/getCompanyByOrget'
            + '/' + orget;
    return axios.get(url);
  },
  getCurrentFunctions: function(mitarbeiter_uid, unternehmen) {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root 
            + 'index.ci.php/extensions/FHC-Core-Personalverwaltung/Api/getCurrentFunctions'
            + '/' + mitarbeiter_uid + '/' + unternehmen;
    return axios.get(url);
  }  ,
  getAllUserFunctions: function(mitarbeiter_uid) {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root 
            + 'index.ci.php/extensions/FHC-Core-Personalverwaltung/Api/getAllUserFunctions'
            + '/' + mitarbeiter_uid;
    return axios.get(url);
  },
  getAllFunctions: function() {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root 
            + 'index.ci.php/extensions/FHC-Core-Personalverwaltung/Api/getAllFunctions';
    return axios.get(url);
  }
};
