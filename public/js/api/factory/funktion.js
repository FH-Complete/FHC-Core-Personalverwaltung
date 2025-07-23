export default {
  getContractFunctions(filter) {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/FunctionsAPI/getContractFunctions';
    if( typeof filter !== 'undefined' && filter !== null ) {
        url = url + '/' + filter;
    }
    return {
			method: 'get',
			url,
		};
    
  },
  getOrgetsForCompany(unternehmen) {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/OrgAPI/getOrgetsForCompany'
            + '/' + unternehmen;
    return {
			method: 'get',
			url,
		};
  },
  getCompanyByOrget(orget) {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/OrgAPI/getCompanyByOrget'
            + '/' + orget;
    return {
			method: 'get',
			url,
		};
  },
  getCurrentFunctions(mitarbeiter_uid, unternehmen) {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/FunctionsAPI/getCurrentFunctions'
            + '/' + mitarbeiter_uid + '/' + unternehmen;
    return {
			method: 'get',
			url, 
		};
  }  ,
  getAllUserFunctions(mitarbeiter_uid) {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/FunctionsAPI/getAllUserFunctions'
            + '/' + mitarbeiter_uid;
    return {
			method: 'get',
			url, 
		};
  },
  getAllFunctions() {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/FunctionsAPI/getAllFunctions';
    return {
			method: 'get',
			url, 
		};
  }
};
