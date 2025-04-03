export default {

  byPerson: function(person_id) {
    let url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/issue/byPerson';
    return this.$fhcApi.get(url, { person_id: person_id});
  },

  countPersonOpenIssues: function(person_id) {
    let url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/IssueChecker/countPersonOpenIssues/'
            + person_id;
    return this.$fhcApi.get(url);
  },

  checkPerson: function(person_id) {
    let url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/IssueChecker/checkPerson/'
            + person_id;
    return this.$fhcApi.post(url);
  },

  openIssuesPersons: function() {
    let url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/issue/PersonenMitOffenenIssues';
    return this.$fhcApi.get(url);
  },
  
};
