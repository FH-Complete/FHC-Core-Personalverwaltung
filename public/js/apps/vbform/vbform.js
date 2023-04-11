import vertragsbestandteillist from '../../components/vbform/vertragsbestandteillist.js';
import presets from './presets.js';
import debug_viewer from '../../components/vbform/debug_viewer.js';
import vbformhelper from '../../components/vbform/vbformhelper.js';
import store from '../../components/vbform/vbsharedstate.js';
import presets_chooser from './../../components/vbform/presets_chooser.js';
import fhcapifactory from "../../api/vbform/api.js";

Vue.$fhcapi = fhcapifactory;

Vue.createApp({
  template: `
  <div class="container-fluid">
    <h1>{{ title }}</h1>

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

  </div>
  `,
  data: function() {
    return {
      vbhjson: presets,
      "title": "Vertragsbestandteil Form",
      presets: presets,
      preset: presets['aenderung'][0],
      store: store
    };
  },
  components: {
    'presets_chooser': presets_chooser,
    'debug_viewer': debug_viewer,
    'vbformhelper': vbformhelper
  },
  created: function() {
    this.store.setMode('aenderung');
    this.presettostore();
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
    }
  },
  computed: {
  }
}).mount('#main');
