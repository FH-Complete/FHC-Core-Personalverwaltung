export default {
  storeToTmpStore: function(payload) {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/storeToTmpStore';
    if( ((payload?.tmpStoreId !== undefined)
        && !isNaN(parseInt(payload.tmpStoreId))
        && parseInt(payload.tmpStoreId) > 0) ) {
      url = url + '/' + payload.tmpStoreId;
    }
    return this.$fhcApi.post(url, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },
  listTmpStoreForMA: function(mauid) {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/listTmpStoreForMA/' 
            + mauid;
    return this.$fhcApi.get(url);      
  },
  getTmpStoreById: function(id) {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/getTmpStoreById/' 
            + id;
    return this.$fhcApi.get(url);
  },
  deleteFromTmpStore: function(id) {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/deleteFromTmpStore/' 
            + id;
    return this.$fhcApi.post(url);
  }
};
