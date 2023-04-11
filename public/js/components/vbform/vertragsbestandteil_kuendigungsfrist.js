import gehaltsbestandteilhelper from './gehaltsbestandteilhelper.js';
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
      <div class="col-3">
        <div class="input-group input-group-sm mb-3">
          <input v-model="arbeitgeber_frist" type="text" class="form-control form-control-sm" placeholder="Arbeitgeber Frist" aria-label="arbeitgeber_frist">
          <span class="input-group-text">Wochen</span>
        </div>
      </div>
      <div class="col-3">
        <div class="input-group input-group-sm mb-3">
          <input v-model="arbeitnehmer_frist" type="text" class="form-control form-control-sm" placeholder="Arbeitnehmer Frist" aria-label="arbeitnehmer_frist">
          <span class="input-group-text">Wochen</span>
        </div>
      </div>
      <div class="col-1">&nbsp;</div>
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
      arbeitgeber_frist: '',
      arbeitnehmer_frist: ''
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
      if( this.config?.data?.arbeitgeber_frist !== undefined ) {
        this.arbeitgeber_frist = this.config.data.arbeitgeber_frist;
      }
      if( this.config?.data?.arbeitnehmer_frist !== undefined ) {
        this.arbeitnehmer_frist = this.config.data.arbeitnehmer_frist;
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
          arbeitgeber_frist: this.arbeitgeber_frist,
          arbeitnehmer_frist: this.arbeitnehmer_frist,
          gueltigkeit: this.$refs.gueltigkeit.getPayload(),
        }
      };
    }
  }
}