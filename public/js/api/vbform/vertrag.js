export default {
  saveForm: function(formdata) {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root + 'index.ci.php/extensions/FHC-Core-Personalverwaltung/Api/saveVertrag';
    return axios.post(url, formdata, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
