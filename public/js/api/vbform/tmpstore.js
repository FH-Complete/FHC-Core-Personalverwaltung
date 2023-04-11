export default {
  storeToTmpStore: function(payload) {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root 
            + 'index.ci.php/extensions/FHC-Core-Personalverwaltung/Api/storeToTmpStore';
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
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root 
            + 'index.ci.php/extensions/FHC-Core-Personalverwaltung/Api/listTmpStoreForMA/' 
            + mauid;
    return axios.get(url);      
  },
  getTmpStoreById: function(id) {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root 
            + 'index.ci.php/extensions/FHC-Core-Personalverwaltung/Api/getTmpStoreById/' 
            + id;
    return axios.get(url);
  }
};
