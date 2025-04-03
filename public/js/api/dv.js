export default {
  getUnternehmen: function() {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/OrgAPI/getUnternehmen';
    return this.$fhcApi.get(url);
  },
  getVertragsarten: function() {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getVertragsarten';
    return this.$fhcApi.get(url);
  },
  getDVByID: function(dvid) {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/dvByID/' + dvid;
    return this.$fhcApi.get(url);
  },
  endDV: function(payload) {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/endDV';
    return this.$fhcApi.post(url, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },
  deactivateDV: function(payload) {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/deactivateDV';
    return this.$fhcApi.post(url, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },
  getDvEndeGruende: function() {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/getDvEndeGruende';
    return this.$fhcApi.get(url);
  }
};
