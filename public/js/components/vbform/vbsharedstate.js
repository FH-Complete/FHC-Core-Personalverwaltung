import { reactive } from 'vue';

export default reactive({
  mode: '',
  unternehmen: '',
  mitarbeiter_uid: '',
  tmpstoreid: null,
  showmsgs: true, 
  gueltigkeit: {
    gueltig_ab: '',
    gueltig_bis: ''
  },
  dv: {

  },
  vbs: {

  },
  getDV: function() {
    return this.dv;
  },
  setDV: function(dv) {
    this.dv = JSON.parse(JSON.stringify(dv));
  },
  getDVPayload: function() {
    return JSON.parse(JSON.stringify(this.dv));
  },
  addVB: function(uuid, vb) {
    this.vbs[uuid] = vb;
  },
  removeVB: function(uuid) {
    delete this.vbs[uuid];
  },
  getVB: function(uuid) {
    if( typeof this.vbs[uuid] !== 'undefined' ) {
      return this.vbs[uuid];
    }  
    return null;
  },
  getVBsPayload: function() {
    return JSON.parse(JSON.stringify(this.vbs));
  },
  getMode: function() {
    return this.mode;
  },
  setMode: function(mode) {
    this.mode = mode;
  },
  getTmpStoreId: function() {
      return this.tmpstoreid;
  },
  setTmpStoreId: function(tmpstoreid) {
      this.tmpstoreid = tmpstoreid;
  },
  reset: function() {
    this.gueltigkeit = {
      gueltig_ab: '',
      gueltig_bis: ''
    };
    this.dv = {
        data: {
            vertragsart_kurzbz: ''
        }
    };
    this.vbs = {};
  }
});
