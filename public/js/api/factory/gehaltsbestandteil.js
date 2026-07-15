export default {
    gbtByDV(dv_id, unixdate) {
        return {
            method: 'get',
            url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/gbtByDV',
            params: { dv_id: dv_id, d: unixdate}
          }
    },
    gbtChartDataByDV(dv_id, unixdate) {
        return {
            method: 'get',
            url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/gbtChartDataByDV',
            params: { dv_id}
          }
    },
    getGB(gbid) {
        return {
            method: 'get',
            url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/getGB/' + gbid,
        }
    },
    getGehaltstypen() {
        return {
            method: 'post',
            url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getGehaltstypen',
        }
    }
};