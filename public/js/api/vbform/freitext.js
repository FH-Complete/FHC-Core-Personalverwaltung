export default {
  getFreitexttypen: function() {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router
            + '/extensions/FHC-Core-Personalverwaltung/Api/getFreitexttypen';
    return axios.get(url);
  }
};
