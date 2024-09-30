export default {
  storeToTmpStore: function(payload) {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/api/v1/DVAPI/storeToTmpStore';
    if( ((payload?.tmpStoreId !== undefined)
        && !isNaN(parseInt(payload.tmpStoreId))
        && parseInt(payload.tmpStoreId) > 0) ) {
      url = url + '/' + payload.tmpStoreId;
    }
    return axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },
  listTmpStoreForMA: function(mauid) {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/api/v1/DVAPI/listTmpStoreForMA/' 
            + mauid;
    return axios.get(url);      
  },
  getTmpStoreById: function(id) {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/api/v1/DVAPI/getTmpStoreById/' 
            + id;
    return axios.get(url);
  },
  deleteFromTmpStore: function(id) {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root  + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/api/v1/DVAPI/deleteFromTmpStore/' 
            + id;
    return axios.post(url);
  }
};
