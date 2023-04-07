import gehaltsbestandteilhelper from './gehaltsbestandteilhelper.js'
import gueltigkeit from './gueltigkeit.js';
import configurable from '../../mixins/vbform/configurable.js';
import errors from './errors.js';
import infos from './infos.js';

export default {
  template: `
  <div class="py-2" :class="vbcssclasses">
    <infos :infos="(config?.guioptions?.infos !== undefined) ? config.guioptions.infos : []"></infos>
    <errors :errors="(config?.guioptions?.errors !== undefined) ? config.guioptions.errors : []"></errors>
    <div class="row g-2 py-2">
      <div class="col-2">
        <div class="form-check">
          <input v-model="mode" class="form-check-input form-check-input-sm" type="radio"
            :name="'vbfunktionmode_' + config.guioptions.id" :id="'vbfunktionmode1_' + config.guioptions.id" value="neu">
          <label class="form-check-label" :for="'vbfunktionmode1_' + config.guioptions.id">Neue Funktion</label>
        </div>
      </div>
      <div class="col-3">
        <div class="form-check">
          <input v-model="mode" class="form-check-input form-check-input-sm" type="radio"
            :name="'vbfunktionmode_' + config.guioptions.id" :id="'vbfunktionmode2_' + config.guioptions.id" value="bestehende">
          <label class="form-check-label" :for="'vbfunktionmode2_' + config.guioptions.id">bestehende Funktion</label>
        </div>
      </div>
      <div class="col-7">&nbsp;</div>
    </div>
    <div class="row g-2">
    <template v-if="mode === 'neu'">
      <div class="col">
        <input v-model="funktion" :disabled="isinputdisabled('funktion')" type="text" class="form-control form-control-sm" placeholder="Funktion" aria-label="funktion">
      </div>
      <div class="col">
        <input v-model="orget" type="text" class="form-control form-control-sm" placeholder="Organisations-Einheit" aria-label="orget">
      </div>
    </template>
    <template v-else-if="mode === 'bestehende'">
      <div class="col">
        <select v-model="benutzerfunktionid" class="form-select form-select-sm">
          <option value="" disabled>bestehende Funktion wählen</option>
          <option value="67675">Leitung Core-Entwicklung</option>
          <option value="67676">Leitung Stg BBE</option>
        </select>
      </div>
    </template>
      <gueltigkeit ref="gueltigkeit" :config="getgueltigkeit"></gueltigkeit>
      <div class="col-1">
        <button v-if="isremoveable" type="button" class="btn-close btn-sm p-2 float-end" @click="removeVB" aria-label="Close"></button>
      </div>
    </div>
    <gehaltsbestandteilhelper v-if="canhavegehaltsbestandteile" ref="gbh" v-bind:preset="getgehaltsbestandteile"></gehaltsbestandteilhelper>
  </div>
  `,
  components: {
    'gehaltsbestandteilhelper': gehaltsbestandteilhelper,
    'gueltigkeit': gueltigkeit,
    'infos': infos,
    'errors': errors
  },
  mixins: [
    configurable
  ],
  emits: {
    removeVB: null
  },
  data: function () {
    return {
      id: null,
      funktion: '',
      orget: '',
      benutzerfunktionid: '',
      mode: 'neu'
    }
  },
  created: function() {
    this.setDataFromConfig();
  },
  methods: {
    setDataFromConfig: function() {
      if( typeof this.config?.data?.id !== undefined ) {
        this.id = this.config.data.id;
      }
      if( typeof this.config?.data?.funktion !== undefined ) {
        this.funktion = this.config.data.funktion;
      }
      if( typeof this.config?.data?.orget !== undefined ) {
        this.orget = this.config.data.orget;
      }
    },
    removeVB: function() {
      this.$emit('removeVB', {id: this.config.guioptions.id});
    },
    getGehaltsbestandteilePayload: function() {
      return (this.$refs?.gbh !== undefined) ? this.$refs.gbh.getPayload() : [];
    },
    getPayload: function() {
      return {
        type: this.config.type,
        guioptions: this.config.guioptions,
        data: {
          id: this.id,
          funktion: this.funktion,
          orget: this.orget,
          gueltigkeit: this.$refs.gueltigkeit.getPayload()
        },
        gbs: this.getGehaltsbestandteilePayload()
      };
    }
  }
}
