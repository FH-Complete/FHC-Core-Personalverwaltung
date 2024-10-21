export default {
	getAll: function(filterDate, exportCSV) {
		var url = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
                + '/extensions/FHC-Core-Personalverwaltung/apis/SalaryExport/getAll';
		if (filterDate == null) return axios.get(url);
		if (!!exportCSV) {
			window.open(url + '?von=' + filterDate[0] + '&bis=' + filterDate[1] + '&export=true')
			return
		}
		return axios.get(url, { params: { von: filterDate[0], bis: filterDate[1], export: !!exportCSV } });

	},
	getSalaryRangeList: function(uid) {
		var url = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
                + '/extensions/FHC-Core-Personalverwaltung/apis/SalaryExport/getSalaryExportList';
		return axios.get(url);
	}
	
};
