export default {

  allByPerson: function(uid) {
    let url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/api/getPersonFristenListe/' + uid;
    return axios.get(url);
  },

  all: function() {
    let url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/api/getFristenListe';
    return axios.get(url);
  },

  updateFristenListe: function() {
    let url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/api/updateFristenListe';
    return axios.get(url);
  },

  updateFristStatus: function(frist_id, status_kurzbz) {
    let url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/api/updateFristStatus';
    return axios.post(url, {frist_id, status_kurzbz}, {
      headers: {
        'Content-Type': 'application/json'
      } 
    })  
  },
  
  upsertFrist: function(frist) {
    let url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/api/upsertFrist';
    return axios.post(url, frist, {
      headers: {
        'Content-Type': 'application/json'
      } 
    })  
  },

  deleteFrist: function(frist_id) {
    let url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/api/deleteFrist';
    return axios.post(url, {frist_id}, {
      headers: {
        'Content-Type': 'application/json'
      } 
    })  
  }, 

  getFristenStatus: function() {
    let url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/api/getFristenStatus';
    return axios.get(url);
  },

  getFristenEreignisse: function() {
    let url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/api/getFristenEreignisse';
    return axios.get(url);
  },

};
