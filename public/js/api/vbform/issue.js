export default {

  byPerson: function(person_id) {
    let url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router + '/extensions/FHC-Core-Personalverwaltung/apis/issue/byPerson';
    return axios.get(url, { params: { person_id: person_id} });
  },
  
};
