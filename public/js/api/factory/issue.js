export default {

  byPerson(person_id) {
    return {
      method: 'get',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/issue/byPerson',  
      params: { person_id }
    }
  },

  countPersonOpenIssues(person_id) {
    return {
      method: 'get',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/IssueChecker/countPersonOpenIssues/'
            + person_id,  
    }
  },

  checkPerson(person_id) {
    return {
			method: 'post',
			url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/IssueChecker/checkPerson/'
            + person_id,  
		}
  },

  openIssuesPersons() {
    return {
			method: 'get',
			url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/issue/PersonenMitOffenenIssues',  
		}
  },
  
};
