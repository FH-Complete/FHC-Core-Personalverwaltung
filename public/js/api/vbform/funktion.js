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
  getCurrentFunctions: function(mitarbeiter_uid, unternehmen) {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root 
            + 'index.ci.php/extensions/FHC-Core-Personalverwaltung/Api/getCurrentFunctions'
            + '/' + mitarbeiter_uid + '/' + unternehmen;
    return axios.get(url);
  }  
};
