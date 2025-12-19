export default {

	getOpenIssuesByProperties(person_id, oe_kurzbz, fehlertyp_kurzbz, apps, behebung_parameter)
	{
		return {
			method: 'get',
			url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonalIssues/getOpenIssuesByProperties',
			params: { person_id, oe_kurzbz, fehlertyp_kurzbz, apps, behebung_parameter }
		};
	},
	getPersonenMitOffenenIssues()
	{
		return {
			method: 'get',
			url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonalIssues/getPersonenMitOffenenIssues'
		};
	}

}