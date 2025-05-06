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
    }

}    