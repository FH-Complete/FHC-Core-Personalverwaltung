export default {
	getAll: function(filterPerson, filterDate, exportCSV) {
		var url = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
                + '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/SalaryExport/getAll';
		if (filterDate == null) return axios.get(url);

		if (!filterPerson) {
			filterPerson = '';
		}
		if (!!exportCSV) {
			window.open(url + '?von=' + filterDate[0] + '&bis=' + filterDate[1] + '&export=true' + '&filterPerson=' + encodeURIComponent(filterPerson))
			return
		}
		return axios.get(url, { params: { von: filterDate[0], bis: filterDate[1], export: !!exportCSV, filterPerson: filterPerson } });

	},
	getSalaryRangeList: function(uid) {
		var url = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
                + '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/SalaryExport/getSalaryExportList';
		return axios.get(url);
	}
	
};
