export default {
    getGemeinden(plz) {
        return {
          method: 'get',
          url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getGemeinden',
          params: { plz }
        }
    },
    getOrtschaften(plz) {
        return {
          method: 'get',
          url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getOrtschaften',
          params: { plz },
        };
    },
    getContractExpire(year, month) {
        return {
          method: 'get',
          url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getContractExpire',
          params: { year: year, month: month}
        };
    },
    getContractNew(year, month) {
      return {
        method: 'get',
        url: 'extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getContractNew',
        params: { year: year, month: month}
      };
    },
    getBirthdays(date) {
      return {
        method: 'get',
        url: 'extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getBirthdays',
        params: { date },
      };
    },
    getCovidState(person_id, date) {
      return {
        method: 'get',
        url: 'extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getCovidState',
        params: { person_id: person_id, d: date},
      };
    },
    getAllCourseHours(uid) {
      return {
        method: 'get',
        url: `extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getAllCourseHours?uid=${uid}`,
      };
    },
    getAllSupportHours(uid) {
      return {
        method: 'get',
        url: `extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getAllSupportHours?uid=${uid}`,
      };
    },
    // migrated from loader.js
    getNations() {
      return {
        method: 'get',
        url: 'extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getNations',
      }
    },
    getSachaufwandTyp() {
      return {
        method: 'get',
        url: 'extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getSachaufwandtyp',
      }
    },
    getKontakttyp() {
      return {
        method: 'get',
        url: 'extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getKontakttyp',
      }
    },
    getAdressentyp() {
      return {
        method: 'get',
        url: 'extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getAdressentyp',
      }
    },
    getSprache() {
      return {
        method: 'get',
        url: 'extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getSprache',
      }
    },
    getAusbildung() {
      return {
        method: 'get',
        url: 'extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getAusbildung',
      }
    },
    getStandorteIntern() {
      return {
        method: 'get',
        url: 'extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getStandorteIntern',
      }
    },
    getOrte() {
      return {
        method: 'get',
        url: 'extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getOrte',
      }
    },
    getKarenztypen() {
      return {
        method: 'get',
        url: 'extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getKarenztypen',
      }
    },
    getGehaltstypen() {
      return {
        method: 'get',
        url: 'extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getGehaltstypen',
      }
    },
    getVertragsarten() {
      return {
        method: 'get',
        url: 'extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getVertragsarten',
      }
    },

    getVertragsbestandteiltypen() {
      return {
        method: 'get',
        url: 'extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getVertragsbestandteiltypen',
      }
    },
    getTeilzeittypen() {
      return {
        method: 'get',
        url: 'extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getTeilzeittypen',
      }
    },
    getFreitexttypen() {
      return {
        method: 'get',
        url: 'extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getFreitexttypen',
      }
    },
    getStundensatztypen() {
      return {
        method: 'get',
        url: 'extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getStundensatztypen',
      }
    },
/*     getUnternehmen() {
      return {
        method: 'get',
        url: 'extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getUnternehmen',
      }
    }, */
}    
