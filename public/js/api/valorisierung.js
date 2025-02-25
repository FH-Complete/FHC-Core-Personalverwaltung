export default {
  calculateValorisation: function(valorisierunginstanz_kurzbz) {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/Valorisierung/calculateValorisation';
    return this.$fhcApi.post(url, {'valorisierunginstanz_kurzbz': valorisierunginstanz_kurzbz});
  },
  doValorisation: function(valorisierunginstanz_kurzbz) {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/Valorisierung/doValorisation';
    return this.$fhcApi.post(url, {'valorisierunginstanz_kurzbz': valorisierunginstanz_kurzbz});
  },
  getValorisierungsInstanzen: function() {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/Valorisierung/getValorisierungsInstanzen';
    return this.$fhcApi.get(url);
  },
  getValorisationInfo: function(valorisierunginstanz_kurzbz) {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/Valorisierung/getValorisationInfo';
    return this.$fhcApi.get(url, {params: {'valorisierunginstanz_kurzbz': valorisierunginstanz_kurzbz}});
  }
}
