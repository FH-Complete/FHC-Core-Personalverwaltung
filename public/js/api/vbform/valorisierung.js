export default {
  doValorisation: function(valorisierunginstanz_kurzbz) {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root  + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/apis/Valorisierung/doValorisation/' + valorisierunginstanz_kurzbz;
    return axios.post(url);
  },
  getValorisierungsInstanzen: function() {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root  + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/apis/Valorisierung/getValorisierungsInstanzen';
    return axios.get(url);
  }
}  