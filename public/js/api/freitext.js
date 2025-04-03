export default {
  getFreitexttypen: function() {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getFreitexttypen';
    return this.$fhcApi.get(url);
  }
};
