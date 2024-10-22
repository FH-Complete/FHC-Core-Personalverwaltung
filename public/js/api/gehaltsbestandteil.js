export default {
    gbtByDV: function(dv_id, unixdate) {
        var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router + 
                '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/gbtByDV';
        return axios.get(url, { params: { dv_id: dv_id, d: unixdate} });
    },
    gbtChartDataByDV: function(dv_id, unixdate) {
        var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router + 
                '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/gbtChartDataByDV';
        return axios.get(url, { params: { dv_id: dv_id} });
    },
    getGB: function(gbid) {
        let url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router + 
                '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/getGB/' + gbid;
        return axios.get(url);
    },
    getGehaltstypen: function() {
        let url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router + 
                '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getGehaltstypen';
        return axios.get(url);
    }
};