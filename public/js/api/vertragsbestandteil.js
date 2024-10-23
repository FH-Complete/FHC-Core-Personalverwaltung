export default {
  getCurrentVBs: function(dvid) {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/getCurrentVBs/' 
            + dvid;
      return axios.get(url);
  },
  getCurrentAndFutureVBs: function(dvid, options) {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root  + FHC_JS_DATA_STORAGE_OBJECT.ci_router
            + '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/getCurrentAndFutureVBs/' 
            + dvid;
      if( typeof options !== 'undefined' ) {
        const params = new URLSearchParams(options);
        url = url + '?' + params.toString();
      }
      return axios.get(url);
  },
  getAllVBs: function(dvid) {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/getAllVBs/' 
            + dvid;
      return axios.get(url);
  },
  getVB: function(vbid) {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root  + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/getVB/' 
            + vbid;
      return axios.get(url);
  }
};
