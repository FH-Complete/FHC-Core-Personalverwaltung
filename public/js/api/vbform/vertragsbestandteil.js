export default {
  getCurrentVBs: function(dvid) {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/Api/getCurrentVBs/' 
            + dvid;
      return axios.get(url);
  },
  getCurrentAndFutureVBs: function(dvid, options) {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root  + FHC_JS_DATA_STORAGE_OBJECT.ci_router
            + '/extensions/FHC-Core-Personalverwaltung/Api/getCurrentAndFutureVBs/' 
            + dvid;
      if( typeof options !== 'undefined' ) {
        const params = new URLSearchParams(options);
        url = url + '?' + params.toString();
      }
      return axios.get(url);
  },
  getAllVBs: function(dvid) {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/Api/getAllVBs/' 
            + dvid;
      return axios.get(url);
  },
  getVB: function(vbid) {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root  + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/Api/getVB/' 
            + vbid;
      return axios.get(url);
  }
};
