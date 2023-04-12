import gueltigkeit from './gueltigkeit.js';
import configurable from '../../mixins/vbform/configurable.js';
import errors from './errors.js';
import infos from './infos.js';

export default {
  template: `
  <div class="border-bottom py-2 mb-3">
    <infos :infos="(config?.guioptions?.infos !== undefined) ? config?.guioptions?.infos : []"></infos>
    <errors :errors="(config?.guioptions?.errors !== undefined) ? config?.guioptions?.errors : []"></errors>
    <div class="row g-2">
      <div class="col-2 form-check form-control-sm">
        <input v-model="zeitaufzeichnung" :disabled="isinputdisabled('zeitaufzeichnung')" class="form-check-input" type="checkbox" value="" :id="'zeitaufzeichnung_' + config.guioptions.id">
        <label class="form-check-label" :for="'zeitaufzeichnung_' + config.guioptions.id">
          Zeitaufzeichnung
        </label>
      </div>
      <div class="col-2 form-check form-control-sm">
        <input v-model="azgrelevant" :disabled="isinputdisabled('azgrelevant')" class="form-check-input" type="checkbox" value="" :id="'azgrelevant_' + config.guioptions.id">
        <label class="form-check-label" :for="'azgrelevant_' + config.guioptions.id">
          AZG-relevant
        </label>
      </div>
      <div class="col-2 form-check form-control-sm">
        <input v-model="homeoffice" :disabled="isinputdisabled('homeoffice')" class="form-check-input" type="checkbox" value="" :id="'homeoffice_' + config.guioptions.id">
        <label class="form-check-label" :for="'homeoffice_' + config.guioptions.id">
          Home-Office
        </label>
      </div>
      <div class="col-1 form-check form-control-sm">&nbsp;</div>
      <gueltigkeit ref="gueltigkeit" :config="getgueltigkeit"></gueltigkeit>
      <div class="col-1">
        <button v-if="isremoveable" type="button" class="btn-close btn-sm p-2 float-end" @click="removeVB" aria-label="Close"></button>
      </div>
    </div>
  </div>
  `,
  components: {
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
      zeitaufzeichnung: '',
      azgrelevant: '',
      homeoffice: ''
    }
  },
  created: function() {
    this.setDataFromConfig();
  },
  methods: {
    setDataFromConfig: function() {
      if( this.config?.data?.id !== undefined ) {
        this.id = this.config.data.id;
      }
      if( this.config?.data?.zeitaufzeichnung !== undefined ) {
        this.zeitaufzeichnung = this.config.data.zeitaufzeichnung;
      }
      if( this.config?.data?.azgrelevant !== undefined ) {
        this.azgrelevant = this.config.data.azgrelevant;
      }
      if( this.config?.data?.homeoffice !== undefined ) {
        this.homeoffice = this.config.data.homeoffice
      }
    },
    removeVB: function() {
      this.$emit('removeVB', {id: this.config.guioptions.id});
    },
    getPayload: function() {
      return {
        type: this.config.type,
        guioptions: this.config.guioptions,
        data: {
          id: this.id,
          zeitaufzeichnung: Boolean(this.zeitaufzeichnung),
          azgrelevant: Boolean(this.azgrelevant),
          homeoffice: Boolean(this.homeoffice),
          gueltigkeit: this.$refs.gueltigkeit.getPayload()
        }
      };
    }
  }
}
