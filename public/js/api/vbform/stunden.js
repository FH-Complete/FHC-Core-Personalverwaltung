export default {
  getTeilzeittypen: function() {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/api/v1/CommonsAPI/getTeilzeittypen';
    return axios.get(url);
  }  
};
