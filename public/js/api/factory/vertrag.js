export default {
  saveForm(mitarbeiter_uid, formdata, dryrun) {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/saveVertrag'
            + '/' + mitarbeiter_uid;
    if( typeof dryrun !== 'undefined' ) {
        url = url + '/' + dryrun;
    }   
    return {
			method: 'post',
			url,  
      params: formdata  
		}
  },
  vertragByDV(dv_id, unixdate) {
    return {
			method: 'get',
			url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/vertragByDV',  
      params: { dv_id: dv_id, d: unixdate }    
		}
  },
};
