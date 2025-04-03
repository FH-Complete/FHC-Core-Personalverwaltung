export default {
    gbtByDV: function(dv_id, unixdate) {
        var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router + 
                '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/gbtByDV';
        return this.$fhcApi.get(url, { dv_id: dv_id, d: unixdate});
    },
    gbtChartDataByDV: function(dv_id, unixdate) {
        var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router + 
                '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/gbtChartDataByDV';
        return this.$fhcApi.get(url, { dv_id: dv_id});
    },
    getGB: function(gbid) {
        let url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router + 
                '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/getGB/' + gbid;
        return this.$fhcApi.get(url);
    },
    getGehaltstypen: function() {
        let url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getGehaltstypen';
        return this.$fhcApi.get(url);
    }
};