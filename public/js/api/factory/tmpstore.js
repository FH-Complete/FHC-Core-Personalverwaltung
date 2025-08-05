export default {
  storeToTmpStore(payload) {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/storeToTmpStore';
    if( ((payload?.tmpStoreId !== undefined)
        && !isNaN(parseInt(payload.tmpStoreId))
        && parseInt(payload.tmpStoreId) > 0) ) {
      url = url + '/' + payload.tmpStoreId;
    }
    return {
      method: 'post',
      url,   
      params: payload,
    }  
  },
  listTmpStoreForMA(mauid) {
    return {
      method: 'get',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/listTmpStoreForMA/' 
          + mauid,   
    }      
  },
  getTmpStoreById(id) {
    return {
      method: 'get',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/getTmpStoreById/' 
            + id,   
    }
  },
  deleteFromTmpStore(id) {
    return {
      method: 'post',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/deleteFromTmpStore/' 
            + id,   
    }
  }
  
};
