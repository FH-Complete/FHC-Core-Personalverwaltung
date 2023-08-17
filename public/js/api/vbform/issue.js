export default {

  byPerson: function(person_id) {
    let url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/apis/issue/byPerson';
    return axios.get(url, { params: { person_id: person_id} });
  },

  countPersonOpenIssues: function(person_id) {
    let url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/apis/IssueChecker/countPersonOpenIssues/'
            + person_id;
    return axios.get(url);
  },

  checkPerson: function(person_id) {
    let url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/apis/IssueChecker/checkPerson/'
            + person_id;
    return axios.post(url);
  },

  openIssuesPersons: function() {
    let url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/apis/issue/PersonenMitOffenenIssues';
    return axios.get(url);
  },
  
};
