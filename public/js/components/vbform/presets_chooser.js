import store from './vbsharedstate.js';

export default {
  name: 'PresetsChooser',
  template: `
  <div class="row g-2 py-2">
    <div class="col-12">

      <select v-model="store.mode" @change="selectmode" v-if="showselectmode" class="form-select form-select-sm">
        <option value="neuanlage" selected>Neuanlage</option>
        <option value="aenderung">Änderung</option>
        <option value="korrektur">Korrektur</option>
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
      this.$nextTick(() => {
          this.selectmode();
      });
    }
  },
  methods: {
    resetSelectedPreset: function() {
      this.selectedpresetidx = -1;
    },
    selectmode: function() {
      this.resetSelectedPreset();
      if( this.store.mode === 'aenderung' || this.store.mode === 'korrektur' ) {
        this.usedpresets = [];
        const vertragsart_kurzbz = this.store.getDV().data.vertragsart_kurzbz;
        for(const preset of this.presets[this.store.mode]) {
            if( preset.guioptions.for_vertragsart_kurzbz.length === 0 
             || preset.guioptions.for_vertragsart_kurzbz.indexOf(vertragsart_kurzbz) > -1  ) {
                this.usedpresets.push(preset);
                if( preset.guioptions?.default_for_vertragsart_kurzbz !== undefined 
                        && preset.guioptions.default_for_vertragsart_kurzbz.indexOf(vertragsart_kurzbz) > -1 ) {
                    this.selectedpresetidx = (this.usedpresets.length - 1);
                }
            }
        }
      } else {
        this.usedpresets = ( typeof this.presets[this.store.mode] !== 'undefined')
                        ? this.presets[this.store.mode]
                        : [];
      }
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
                       dienstverhaeltnisid: null,
                       gueltigkeit: {
                           guioptions: {},
                           data: {}
                       }
                     }
                   },
                   vbs: {}
                 };
      this.store.reset();
      this.$emit("presetselected", preset);
    }
  }
}
