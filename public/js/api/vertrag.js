export default {
  saveForm: function(mitarbeiter_uid, formdata, dryrun) {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/saveVertrag'
            + '/' + mitarbeiter_uid;
    if( typeof dryrun !== 'undefined' ) {
        url = url + '/' + dryrun;
    }
    return this.$fhcApi.post(url, formdata, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },
  vertragByDV: function(dv_id, unixdate) {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/vertragByDV';
    return this.$fhcApi.get(url, { dv_id: dv_id, d: unixdate });
  },
};
