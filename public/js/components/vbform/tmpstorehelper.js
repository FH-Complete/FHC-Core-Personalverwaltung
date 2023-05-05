import store from './vbsharedstate.js';

export default {
  template: `
  <div class="row g-2 py-2">
    <div class="col-7">
        
      <select v-model="selectedtmpstoreidx" class="form-select form-select-sm">
        <option value="-1" disabled>Zwischenspeicherung wählen</option>
        <option v-for="(tmpstore, idx) in tmpstores[store.mode]" :key="tmpstore.tmp_store_id"
                :value="idx">
                  {{ tmpstore.tmp_store_id  }} {{ tmpstore.insertvon }} - {{ tmpstore.insertamum }} {{ tmpstore.updatevon }} - {{ tmpstore.updateamum }}
                </option>
      </select>

    </div>
    <div class="col-5">
        <div class="btn-toolbar" role="toolbar" aria-label="TmpStore Toolbar">
            <div class="btn-group me-2" role="group" aria-label="First group">
                <button class="btn btn-warning btn-sm float-end" @click="selecttmpstore">Laden</button>
            </div>
            <div class="btn-group me-2" role="group" aria-label="Second group">
                <button class="btn btn-warning btn-sm float-end" @click="saveToTmpStore">Zwischenspeichern</button>
            </div>
            <div class="btn-group" role="group" aria-label="Third group">
                <button class="btn btn-warning btn-sm float-end" @click="deleteFromTmpStore">Löschen</button>
            </div>
        </div>        
    </div>
  </div>
  `,
  data: function() {
    return {
      store: store,
      selectedtmpstoreidx: -1,
      tmpstores: {}
    };
  },
  emits: [
    "loadedfromtmpstore",
    "savetotmpstore"
  ],
  created: function() {
      this.fetchTmpStoreList();
  },
  watch: {
    'store.mode': function() {
        this.fetchTmpStoreList();
    },
    'store.mitarbeiter_uid': function() {
        this.fetchTmpStoreList();
    }
  },
  methods: {
    fetchTmpStoreList: function(resetselected) {
      if( typeof resetselected === 'undefined' ) {
          var resetselected = true;
      }  
      Vue.$fhcapi.TmpStore.listTmpStoreForMA(this.store.mitarbeiter_uid)
      .then((response) => {
        this.tmpstores = response.data.data;
        if(resetselected === true) {
          this.selectedtmpstoreidx = -1;
        } else {
          this.selectedtmpstoreidx = this.store.tmpstoreid;
        }
      });
    },
    deleteFromTmpStore: function() {
        if( typeof this.tmpstores[this.store.mode][this.selectedtmpstoreidx] !== 'undefined' ) {
            const tmpstoreid = this.tmpstores[this.store.mode][this.selectedtmpstoreidx]['tmp_store_id'];
            
            Vue.$fhcapi.TmpStore.deleteFromTmpStore(tmpstoreid)
            .then((response) => {
              this.fetchTmpStoreList();
              console.log('deleteFromTmpStore executed.');
            });
        }
    },
    saveToTmpStore: function() {
        this.$emit('savetotmpstore');
    },
    selecttmpstore: function() {
        if( typeof this.tmpstores[this.store.mode][this.selectedtmpstoreidx] !== 'undefined' ) {
            const tmpstoreid = this.tmpstores[this.store.mode][this.selectedtmpstoreidx]['tmp_store_id'];
            
            Vue.$fhcapi.TmpStore.getTmpStoreById(tmpstoreid)
            .then((response) => {
              console.log('loadFromTmpStore executed.');
              this.store.setTmpStoreId(response.data.data.tmp_store_id);
              this.$emit('loadedfromtmpstore', response.data.data.formdata);
            });
        }
        
    }
  }
}
