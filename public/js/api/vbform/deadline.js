export default {

  allByPerson: function(uid, all) {
    let url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/api/v1/FristenAPI/getPersonFristenListe/' + uid 
            + '?all=' + all;
    return axios.get(url);
  },

  all: function() {
    let url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/api/v1/FristenAPI/getFristenListe';
    return axios.get(url);
  },

  updateFristenListe: function() {
    let url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/api/v1/FristenAPI/updateFristenListe';
    return axios.get(url);
  },

  updateFristStatus: function(frist_id, status_kurzbz) {
    let url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/api/v1/FristenAPI/updateFristStatus';
    return axios.post(url, {frist_id, status_kurzbz}, {
      headers: {
        'Content-Type': 'application/json'
      } 
    })  
  },

  batchUpdateFristStatus: function(fristen, status_kurzbz) {
    let url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/api/v1/FristenAPI/batchUpdateFristStatus';
    return axios.post(url, {fristen, status_kurzbz}, {
      headers: {
        'Content-Type': 'application/json'
      } 
    })  
  },
  
  upsertFrist: function(frist) {
    let url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/api/v1/FristenAPI/upsertFrist';
    return axios.post(url, frist, {
      headers: {
        'Content-Type': 'application/json'
      } 
    })  
  },

  deleteFrist: function(frist_id) {
    let url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/api/v1/FristenAPI/deleteFrist';
    return axios.post(url, {frist_id}, {
      headers: {
        'Content-Type': 'application/json'
      } 
    })  
  }, 

  getFristenStatus: function() {
    let url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/api/v1/FristenAPI/getFristenStatus';
    return axios.get(url);
  },

  getFristenEreignisse: function() {
    let url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/api/v1/FristenAPI/getFristenEreignisse';
    return axios.get(url);
  },

  getFristenEreignisseManuell: function() {
    let url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/api/v1/FristenAPI/getFristenEreignisse?manuell=1';
    return axios.get(url);
  },

};
