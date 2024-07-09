export default {
  calculateValorisation: function(valorisierunginstanz_kurzbz) {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root  + FHC_JS_DATA_STORAGE_OBJECT.ci_router
            + '/extensions/FHC-Core-Personalverwaltung/apis/Valorisierung/calculateValorisation';
    return axios.post(url, {'varolisierunginstanz_kurzbz': valorisierunginstanz_kurzbz});
  },
  doValorisation: function(valorisierunginstanz_kurzbz) {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root  + FHC_JS_DATA_STORAGE_OBJECT.ci_router
            + '/extensions/FHC-Core-Personalverwaltung/apis/Valorisierung/doValorisation';
    return axios.post(url, {'varolisierunginstanz_kurzbz': valorisierunginstanz_kurzbz});
  },
  getValorisierungsInstanzen: function() {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root  + FHC_JS_DATA_STORAGE_OBJECT.ci_router
            + '/extensions/FHC-Core-Personalverwaltung/apis/Valorisierung/getValorisierungsInstanzen';
    return axios.get(url);
  }
}
