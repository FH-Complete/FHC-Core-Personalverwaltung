export default {
  calculateValorisation: function(valorisierunginstanz_kurzbz) {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root  + FHC_JS_DATA_STORAGE_OBJECT.ci_router
            + '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/Valorisierung/calculateValorisation';
    return axios.post(url, {'valorisierunginstanz_kurzbz': valorisierunginstanz_kurzbz});
  },
  doValorisation: function(valorisierunginstanz_kurzbz) {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root  + FHC_JS_DATA_STORAGE_OBJECT.ci_router
            + '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/Valorisierung/doValorisation';
    return axios.post(url, {'valorisierunginstanz_kurzbz': valorisierunginstanz_kurzbz});
  },
  getValorisierungsInstanzen: function() {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root  + FHC_JS_DATA_STORAGE_OBJECT.ci_router
            + '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/Valorisierung/getValorisierungsInstanzen';
    return axios.get(url);
  },
  getGehaelter: function(gehaelter_stichtag, gehaelter_oe_kurzbz) {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root  + FHC_JS_DATA_STORAGE_OBJECT.ci_router
            + '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/Valorisierung/getGehaelter';
    return axios.get(url, {params: {'gehaelter_stichtag': gehaelter_stichtag, 'gehaelter_oe_kurzbz': gehaelter_oe_kurzbz}});
  },
  getValorisationInfo: function(valorisierunginstanz_kurzbz) {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root  + FHC_JS_DATA_STORAGE_OBJECT.ci_router
            + '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/Valorisierung/getValorisationInfo';
    return axios.get(url, {params: {'valorisierunginstanz_kurzbz': valorisierunginstanz_kurzbz}});
  },
  getAllUnternehmen: function() {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root  + FHC_JS_DATA_STORAGE_OBJECT.ci_router
            + '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/Valorisierung/getAllUnternehmen';
    return axios.get(url);
  }
}
