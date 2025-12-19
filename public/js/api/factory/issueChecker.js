export default {

	checkPerson(person_id)
	{
		return {
			method: 'post',
			url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonalIssueChecker/checkPerson',  
			params: { person_id }
		};
	},
	countPersonOpenIssues(person_id)
	{
		return {
			method: 'get',
			url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonalIssueChecker/countPersonOpenIssues',
			params: { person_id }
		};
	}

}