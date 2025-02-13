export default {
    filterPerson: function(searchVal) {
      var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/filterPerson';
      return this.$fhcApi.post(url, searchVal, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    },    

    personBaseData: function(person_id) {
      var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/personBaseData';
      return this.$fhcApi.get(url, { person_id: person_id} );
    },
    updatePersonBaseData: function(payload) {
        var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/updatePersonBaseData';
        return this.$fhcApi.post(url, payload, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
    },

    personEmployeeData: function(person_id) {
        var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/personEmployeeData';
        return this.$fhcApi.get(url, { person_id: person_id});
    },
    updatePersonEmployeeData: function(payload) {
        var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/updatePersonEmployeeData';
        return this.$fhcApi.post(url, payload, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
    },
    personEmployeeKurzbzExists: function(uid, kurzbz) {
      var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/personEmployeeKurzbzExists';
      return this.$fhcApi.get(url, { uid, kurzbz});
    },

    deletePersonBankData: function(bankverbindung_id) {
      var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/deletePersonBankData';
      return this.$fhcApi.post(url, {bankverbindung_id: bankverbindung_id}, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    },
    upsertPersonBankData: function(payload) {
        var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/upsertPersonBankData';
        return this.$fhcApi.post(url, payload, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
    },
    personBankData: function(person_id) {
      var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/personBankData';
      return this.$fhcApi.get(url, { person_id: person_id});
    },

    personAddressData: function(person_id) {
      var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/personAddressData';
      return this.$fhcApi.get(url, { person_id: person_id} );
    },
    deletePersonAddressData: function(adresse_id) {
      var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/deletePersonAddressData';
      return this.$fhcApi.post(url, {adresse_id: adresse_id}, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    },
    upsertPersonAddressData: function(payload) {
        var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/upsertPersonAddressData';
        return this.$fhcApi.post(url, payload, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
    },

    personContactData: function(person_id) {
      var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/personContactData';
      return this.$fhcApi.get(url, { person_id: person_id} );
    },
    deletePersonContactData: function(kontakt_id) {
      var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/deletePersonContactData';
      return this.$fhcApi.post(url, {kontakt_id: kontakt_id}, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    },
    upsertPersonContactData: function(payload) {
        var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/upsertPersonContactData';
        return this.$fhcApi.post(url, payload, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
    },



    uidByPerson: function(person_id, uid) {
        var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/uidByPerson';
        return this.$fhcApi.get(url, { person_id: person_id, person_uid: uid} );
    },
    personMaterialExpenses: function(person_id, uid) {
        var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/personMaterialExpenses';
        return this.$fhcApi.get(url, { person_id: person_id, person_uid: uid});
    },
    deletePersonMaterialExpenses: function(sachaufwand_id) {
        var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/deletePersonMaterialExpenses';
        return this.$fhcApi.post(url, {sachaufwand_id: sachaufwand_id}, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
      },
    upsertPersonMaterialExpenses: function(payload) {
        var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/upsertPersonMaterialExpenses';
        return this.$fhcApi.post(url, payload, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
    },

    deletePersonJobFunction: function(benutzerfunktion_id) {
      var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/deletePersonJobFunction';
      return this.$fhcApi.post(url, {benutzerfunktion_id: benutzerfunktion_id}, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    },
    upsertPersonJobFunction: function(payload) {
      var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/upsertPersonJobFunction';
      return this.$fhcApi.post(url, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    },
    updatePersonUnruly: function(payload) {
        const url =  '/api/frontend/v1/checkperson/CheckPerson/updatePersonUnrulyStatus';
        return this.$fhcApi.post(url, payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}