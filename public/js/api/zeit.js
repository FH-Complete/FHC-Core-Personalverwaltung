export default {

    personAbwesenheiten: function(uid) {
        let url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/offTimeByPerson';
        return this.$fhcApi.get(url, { uid: uid });
    },
    personAbwesenheitenByYear: function(uid, year) {
        let url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/offTimeByPerson';
        return this.$fhcApi.get(url, { uid: uid, year: year });
    },
    personZeiterfassungByWeek: function(uid, year, week) {
        let url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/timeRecordingByPerson';
        return this.$fhcApi.get(url, { uid, year, week });
    },

}  