export default {
  getKarenztypen: function() {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getKarenztypen';
    return this.$fhcApi.get(url);
  },
  saveKarenz: function(payload) {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/KarenzAPI/saveKarenz';
    return this.$fhcApi.post(url, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }  
};
