export default {
  getContractFunctions: function(filter) {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/FunctionsAPI/getContractFunctions';
    if( typeof filter !== 'undefined' && filter !== null ) {
        url = url + '/' + filter;
    }
    return this.$fhcApi.get(url);
  },
  getOrgetsForCompany: function(unternehmen) {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/OrgAPI/getOrgetsForCompany'
            + '/' + unternehmen;
    return this.$fhcApi.get(url);
  },
  getCompanyByOrget: function(orget) {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/OrgAPI/getCompanyByOrget'
            + '/' + orget;
    return this.$fhcApi.get(url);
  },
  getCurrentFunctions: function(mitarbeiter_uid, unternehmen) {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/FunctionsAPI/getCurrentFunctions'
            + '/' + mitarbeiter_uid + '/' + unternehmen;
    return this.$fhcApi.get(url);
  }  ,
  getAllUserFunctions: function(mitarbeiter_uid) {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/FunctionsAPI/getAllUserFunctions'
            + '/' + mitarbeiter_uid;
    return this.$fhcApi.get(url);
  },
  getAllFunctions: function() {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/FunctionsAPI/getAllFunctions';
    return this.$fhcApi.get(url);
  }
};
