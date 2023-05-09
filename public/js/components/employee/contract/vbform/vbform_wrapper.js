import presets from '../../../../apps/vbform/presets/presets.js.php';
import debug_viewer from '../../../vbform/debug_viewer.js';
import vbformhelper from '../../../vbform/vbformhelper.js';
import store from '../../../vbform/vbsharedstate.js';
import presets_chooser from '../../../vbform/presets_chooser.js';
import {Modal} from '../../../Modal.js';
import tmpstorehelper from '../../../vbform/tmpstorehelper.js';

export default {
  template: `
    <Modal :title="title + (mode=='aenderung'?' bearbeiten':' anlegen')" ref="modalRef" id="vbformModal">
        <template #body>
    
        <div class="row g-2 py-2">
          <div class="col-3">
            <presets_chooser ref="presetchooserRef" :presets="presets" @presetselected="handlePresetSelected" :showselectmode="false"></presets_chooser>
          </div>
          <div class="col-1 text-center py-2">
            <em>oder</em>
          </div>
          <div class="col-8">
            <tmpstorehelper ref="tmpstorehelper" @loadedfromtmpstore="handleLoadedFromTmpStore" @savetotmpstore="saveToTmpStore"></tmpstorehelper>
          </div>
        </div>
        
        <div class="row g-2 py-2">

          <div class="col-12">
            <vbformhelper ref="vbformhelperRef" :preset="preset" 
                @vbhjsonready="processJSON" 
                @saved="handleSaved"
                @validated="handleValidated"></vbformhelper>
          </div>

        </div>

        <div v-if="debug" class="row">
          <div class="col-12">
            <debug_viewer v-bind:text="vbhjson"></debug_viewer>
          </div>
        </div>
        
    </template>
  </Modal>
  `,
  props: [
      'mode',
      'title',
      'mitarbeiter_uid',
      'dvid',
      'debug'
  ],
  data: function() {
    return {
      vbhjson: presets,
      presets: presets,
      preset: {
        type: 'preset',
        guioptions: {

        },
        children: [],
        dv: {
          data: {
            dienstverhaeltnisid: null
          }
        },
        vbs: {}
      },
      store: store
    };
  },
  emits: [
    "dvsaved"
  ],
  components: {
    'presets_chooser': presets_chooser,
    'debug_viewer': debug_viewer,
    'vbformhelper': vbformhelper,
    'Modal': Modal,
    "tmpstorehelper": tmpstorehelper
  },
  created: function() {
    this.store.setMode(this.mode);
    this.presettostore();
    this.store.mitarbeiter_uid = this.mitarbeiter_uid;
  },
  watch: {
    'mode': function() {
      this.store.setMode(this.mode);
    }
  },
  methods: {
    presetselected: function(preset) {
      if( this.mode === 'aenderung' ) {
          preset.dv.data.dienstverhaeltnisid = this.dvid;
      }
      this.preset = preset;
      this.presettostore();
    },
    presettostore: function() {
      this.store.reset();
      var vbs = JSON.parse(JSON.stringify(this.preset.vbs));
      for( var key in vbs ) {
        this.store.addVB(key, vbs[key]);
      }
      var dv = JSON.parse(JSON.stringify(this.preset.dv));
      this.store.setDV(dv);
    },
    processJSON: function(payload) {
      this.vbhjson = payload;
    },
    handlePresetSelected: function(preset) {
      this.presetselected(preset);
      this.resetTmpStoreHelper();  
    },
    handleValidated: function(payload) {
        this.presetselected(payload);      
    },
    handleSaved: function(payload) {
      this.$refs['tmpstorehelper'].deleteFromTmpStorePromise()
        .then(() => {
        this.$refs['tmpstorehelper'].fetchTmpStoreList();
        this.presetselected(payload);
        this.$emit('dvsaved');
      });
    },
    handleLoadedFromTmpStore: function(payload) {
      this.presetselected(payload);
      this.$refs['presetchooserRef'].resetSelectedPreset();
    },
    showModal: function() {
        this.$refs['modalRef'].show();
    },
    resetTmpStoreHelper: function() {
        this.$refs['tmpstorehelper'].fetchTmpStoreList(true);
        this.store.setTmpStoreId(null);
    },
    saveToTmpStore: function() {
      const formdata = this.$refs['vbformhelperRef'].getPayload();
      const payload = {
        tmpStoreId: this.store.getTmpStoreId(),
        typ: this.store.getMode(),  
        mitarbeiter_uid: this.store.mitarbeiter_uid,  
        formdata: formdata
      };
      Vue.$fhcapi.TmpStore.storeToTmpStore(payload)
      .then((response) => {
        this.store.setTmpStoreId(response.data.meta.tmpstoreid);
        this.$refs['tmpstorehelper'].fetchTmpStoreList(false);
        this.$refs['presetchooserRef'].resetSelectedPreset();
        console.log('storeToTmpStore executed.');
      });
    }
  },
  expose: ['showModal'],
};
