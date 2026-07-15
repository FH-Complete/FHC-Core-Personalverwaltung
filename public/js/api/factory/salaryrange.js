export default {
	getAll(filterDate) {
		let url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/SalaryRange/getAll'
		return {
			method: 'get', url, params: filterDate != null ? { von: filterDate[0], bis: filterDate[1] } : null
		}
	},
	getSalaryRangeList() {
		return {
            method: 'get',
            url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/SalaryRange/getSalaryRangeList',
        }
	},
	deleteSalaryRange(id) {
		return {
			method: 'post',
			url: `/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/SalaryRange/deleteBetrag/${id}`,
		}
	},
	upsertSalaryRange(payload) {
		return {
			method: 'post',
			url: `/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/SalaryRange/upsertBetrag`,
			params: payload,
		}
	},
	
};
