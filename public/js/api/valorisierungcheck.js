export default {
  getDvData: function(dienstverhaeltnis_id) {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/ValorisierungCheck/getDvData';
    return this.$fhcApi.get(url, {'dienstverhaeltnis_id': dienstverhaeltnis_id});
  },
  getValorisierungCheckData: function(dienstverhaeltnis_id) {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/ValorisierungCheck/getValorisierungCheckData';
    return this.$fhcApi.get(url, {'dienstverhaeltnis_id': dienstverhaeltnis_id});
  },
  checkValorisationValidityOfDv: function(dienstverhaeltnis_id) {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/ValorisierungCheck/checkValorisationValidityOfDv';
    return this.$fhcApi.get(url, {'dienstverhaeltnis_id': dienstverhaeltnis_id});
  },
  redoValorisation: function(dienstverhaeltnis_id) {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/ValorisierungCheck/redoValorisation';
    return this.$fhcApi.post(url, {'dienstverhaeltnis_id': dienstverhaeltnis_id});
  }
}
