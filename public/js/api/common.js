export default {
    getGemeinden: function(plz) {
        var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getGemeinden';
        return this.$fhcApi.get(url, { plz: plz} );
    },
    getOrtschaften: function(plz) {
        var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getOrtschaften';
        return this.$fhcApi.get(url, { plz: plz} );
    },
    getContractExpire: function(year, month) {
        var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getContractExpire';
        return this.$fhcApi.get(url, { year: year, month: month} );
    },
    getContractNew: function(year, month) {
      var url = 'extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getContractNew';
      return this.$fhcApi.get(url, { year: year, month: month} );
    },
    getBirthdays: function(date) {
      var url = 'extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getBirthdays';
      return this.$fhcApi.get(url, { date: date} );
    },
    getCovidState: function(person_id, date) {
      var url = 'extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getCovidState';
      return this.$fhcApi.get(url, { person_id: person_id, d: date} );
    }
}    