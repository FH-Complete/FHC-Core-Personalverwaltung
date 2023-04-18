import store from './vbsharedstate.js';

export default {
  template: `
  <div class="row g-2 py-2">
    <div class="col-4">

      <select v-model="selectedmode" @change="selectmode">
        <option value="neuanlage" selected>Neuanlage</option>
        <option value="aenderung">Änderung</option>
      </select>

      <select v-model="selectedpresetidx" @change="selectpreset">
        <option value="-1" disabled>Vorlage wählen</option>
        <option v-for="(preset, idx) in usedpresets" :key="idx"
                :value="idx">
                  {{ preset.guioptions.label }}
                </option>
      </select>

    </div>
    <div class="col-8">&nbsp;</div>
  </div>
  `,
  props:[
    'presets'
  ],
  data: function() {
    return {
      store: store,
      selectedmode: 'aenderung',
      selectedpresetidx: -1,
      usedpresets: []
    };
  },
  emits: [
    "presetselected"
  ],
  created: function() {
    if( this.store.mode !== '' ) {
        this.selectedmode = this.store.mode;
    }
    this.selectmode();
  },
  methods: {
    selectmode: function() {
      this.usedpresets = ( typeof this.presets[this.selectedmode] !== 'undefined')
                       ? this.presets[this.selectedmode]
                       : [];
      this.selectedpresetidx = -1;
      this.selectpreset();
    },
    selectpreset: function() {
      var preset = ( typeof this.usedpresets[this.selectedpresetidx] !== 'undefined' )
                 ? this.usedpresets[this.selectedpresetidx]
                 : {
                   type: preset,
                   guioptions: {

                   },
                   children: [],
                   data: {
                     dienstverhaeltnisid: null
                   },
                   vbs: {}
                 };
      this.store.reset();
      this.store.setMode(this.selectedmode);
      this.$emit("presetselected", preset);
    }
  }
}
