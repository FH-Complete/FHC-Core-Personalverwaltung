import presets from '../../../../apps/vbform/presets.js';
import debug_viewer from '../../../vbform/debug_viewer.js';
import vbformhelper from '../../../vbform/vbformhelper.js';
import store from '../../../vbform/vbsharedstate.js';
import presets_chooser from '../../../vbform/presets_chooser.js';
import {Modal} from '../../../Modal.js';

export default {
  template: `
    <Modal :title="title + (mode=='aenderung'?' bearbeiten':' anlegen')" ref="modalRef" id="vbformModal">
        <template #body>
    
        <presets_chooser :presets="presets" @presetselected="presetselected" :showselectmode="false"></presets_chooser>

        <div class="row g-2 py-2">

          <div class="col-12">
            <vbformhelper ref="vbformhelper" :preset="preset" 
                @vbhjsonready="processJSON" 
                @saved="handleSaved"></vbformhelper>
          </div>

          

        </div>

        <div class="row">
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
      'dvid'
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
  components: {
    'presets_chooser': presets_chooser,
    'debug_viewer': debug_viewer,
    'vbformhelper': vbformhelper,
    'Modal': Modal
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
          preset.data.dienstverhaeltnisid = this.dvid;
      }
      this.preset = preset;
      this.presettostore();
    },
    presettostore: function() {
      var vbs = JSON.parse(JSON.stringify(this.preset.vbs));
      for( var key in vbs ) {
        this.store.addVB(key, vbs[key]);
      }
      this.store.setDV(JSON.parse(JSON.stringify(this.preset.dv)));
    },
    processJSON: function(payload) {
      this.vbhjson = payload;
    },
    handleSaved: function(payload) {
      this.presetselected(payload);
    },
    showModal: function() {
        this.$refs['modalRef'].show();
    }
  },
  expose: ['showModal'],
};
