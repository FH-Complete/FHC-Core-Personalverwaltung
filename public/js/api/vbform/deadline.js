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

};
