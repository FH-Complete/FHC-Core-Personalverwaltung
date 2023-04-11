export default {
  saveForm: function(mitarbeiter_uid, formdata) {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root 
            + 'index.ci.php/extensions/FHC-Core-Personalverwaltung/Api/saveVertrag'
            + '/' + mitarbeiter_uid;
    return axios.post(url, formdata, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
