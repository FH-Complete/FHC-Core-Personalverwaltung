import presets from '../../../../apps/vbform/presets.js';
import debug_viewer from '../../../vbform/debug_viewer.js';
import vbformhelper from '../../../vbform/vbformhelper.js';
import store from '../../../vbform/vbsharedstate.js';
import presets_chooser from '../../../vbform/presets_chooser.js';
import {Modal} from '../../../Modal.js';

export default {
  template: `
    <Modal :title="'Dienstverhältnis ' + (editMode?'bearbeiten':'anlegen')" ref="modalRef">
        <template #body>
    
        <presets_chooser :presets="presets" @presetselected="presetselected"></presets_chooser>

        <div class="row g-2 py-2">

          <div class="col-8">
            <vbformhelper ref="vbformhelper" :preset="preset" 
                @vbhjsonready="processJSON" 
                @saved="handleSaved"></vbformhelper>
          </div>

          <div class="col-4">
            <debug_viewer v-bind:text="vbhjson"></debug_viewer>
          </div>

        </div>
        
    </template>
  </Modal>
  `,
  props: [
      'mode',
      'title',
      'mitarbeiter_uid'
  ],
  data: function() {
    return {
      vbhjson: presets,
      presets: presets,
      preset: presets[this.mode][0],
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
  methods: {
    presetselected: function(preset) {
      this.preset = preset;
      this.presettostore();
    },
    presettostore: function() {
      var vbs = JSON.parse(JSON.stringify(this.preset.vbs));
      for( var key in vbs ) {
        this.store.addVB(key, vbs[key]);
      }
      this.store.setDV(JSON.parse(JSON.stringify(this.preset.data)));
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
