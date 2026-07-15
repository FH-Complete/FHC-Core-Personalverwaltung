export default {

    personAbwesenheiten(uid) {
        return {
            method: 'get',
            url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/offTimeByPerson',   
            params: { uid }   
        }
    },
    personAbwesenheitenByYear(uid, year) {
        return {
            method: 'get',
            url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/offTimeByPerson',   
            params: { uid: uid, year: year }   
        }
    },
    personZeiterfassungByWeek(uid, year, week) {
        return {
            method: 'get',
            url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/timeRecordingByPerson',   
            params: { uid, year, week }
        }
    },

}  