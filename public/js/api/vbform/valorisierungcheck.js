export default {
  getDvGehaltData: function(dienstverhaeltnis_id) {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root  + FHC_JS_DATA_STORAGE_OBJECT.ci_router
            + '/extensions/FHC-Core-Personalverwaltung/apis/ValorisierungCheck/getDvGehaltData';
    return axios.get(url, {params: {'dienstverhaeltnis_id': dienstverhaeltnis_id}});
  },
  getValorisierungCheckData: function(dienstverhaeltnis_id) {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root  + FHC_JS_DATA_STORAGE_OBJECT.ci_router
            + '/extensions/FHC-Core-Personalverwaltung/apis/ValorisierungCheck/getValorisierungCheckData';
    return axios.get(url, {params: {'dienstverhaeltnis_id': dienstverhaeltnis_id}});
  },
  checkValorisationValidityOfDv: function(dienstverhaeltnis_id) {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root  + FHC_JS_DATA_STORAGE_OBJECT.ci_router
            + '/extensions/FHC-Core-Personalverwaltung/apis/ValorisierungCheck/checkValorisationValidityOfDv';
    return axios.get(url, {params: {'dienstverhaeltnis_id': dienstverhaeltnis_id}});
  },
  redoValorisation: function(dienstverhaeltnis_id) {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root  + FHC_JS_DATA_STORAGE_OBJECT.ci_router
            + '/extensions/FHC-Core-Personalverwaltung/apis/ValorisierungCheck/redoValorisation';
    return axios.post(url, {'dienstverhaeltnis_id': dienstverhaeltnis_id});
  }
}
