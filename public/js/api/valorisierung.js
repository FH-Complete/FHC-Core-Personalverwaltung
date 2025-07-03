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
  getGehaelter: function(gehaelter_stichtag, gehaelter_oe_kurzbz) {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/Valorisierung/getGehaelter';
    return this.$fhcApi.get(url, {'gehaelter_stichtag': gehaelter_stichtag, 'gehaelter_oe_kurzbz': gehaelter_oe_kurzbz});
  },
  getValorisationInfo: function(valorisierunginstanz_kurzbz) {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/Valorisierung/getValorisationInfo';
    return this.$fhcApi.get(url, {'valorisierunginstanz_kurzbz': valorisierunginstanz_kurzbz});
  },
  getAllUnternehmen: function() {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/Valorisierung/getAllUnternehmen';
    return this.$fhcApi.get(url);
  }
}
