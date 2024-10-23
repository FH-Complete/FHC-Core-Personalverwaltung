export default {
  saveForm: function(mitarbeiter_uid, formdata, dryrun) {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/saveVertrag'
            + '/' + mitarbeiter_uid;
    if( typeof dryrun !== 'undefined' ) {
        url = url + '/' + dryrun;
    }
    return axios.post(url, formdata, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },
  vertragByDV: function(dv_id, unixdate) {
    var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/vertragByDV';
    return axios.get(url, { params: { dv_id: dv_id, d: unixdate  } });
  },
};
