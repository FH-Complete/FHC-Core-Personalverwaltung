export default {
  getTeilzeittypen: function() {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root + 'index.ci.php/extensions/FHC-Core-Personalverwaltung/Api/getTeilzeittypen';
    return axios.get(url);
  }  
};
