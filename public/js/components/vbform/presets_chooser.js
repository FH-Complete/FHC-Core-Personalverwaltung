import store from './vbsharedstate.js';

export default {
  template: `
  <div class="row g-2 py-2">
    <div class="col-12">

      <select v-model="store.mode" @change="selectmode" v-if="showselectmode" class="form-select form-select-sm">
        <option value="neuanlage" selected>Neuanlage</option>
        <option value="aenderung">Änderung</option>
      </select>

      <select v-model="selectedpresetidx" @change="selectpreset" class="form-select form-select-sm">
        <option value="-1" disabled>Vorlage wählen</option>
        <option v-for="(preset, idx) in usedpresets" :key="idx"
                :value="idx">
                  {{ preset.guioptions.label }}
                </option>
      </select>

    </div>
  </div>
  `,
  props:[
    'presets',
    'showselectmode'
  ],
  data: function() {
    return {
      store: store,
      selectedpresetidx: -1,
      usedpresets: []
    };
  },
  emits: [
    "presetselected"
  ],
  mounted: function() {
    this.selectmode();
  },
  watch: {
    'store.mode': function() {
      this.selectmode();
    }
  },
  methods: {
    resetSelectedPreset: function() {
      this.selectedpresetidx = -1;
    },
    selectmode: function() {
      this.resetSelectedPreset();
      this.usedpresets = ( typeof this.presets[this.store.mode] !== 'undefined')
                       ? this.presets[this.store.mode]
                       : [];
      this.selectpreset();
    },
    selectpreset: function() {
      var preset = ( typeof this.usedpresets[this.selectedpresetidx] !== 'undefined' )
                 ? this.usedpresets[this.selectedpresetidx]
                 : {
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
                 };
      this.store.reset();
      this.$emit("presetselected", preset);
    }
  }
}
