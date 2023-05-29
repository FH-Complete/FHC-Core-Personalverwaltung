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
          <input v-model="stunden" :disabled="isinputdisabled('stunden')" type="text" class="form-control form-control-sm" placeholder="Stunden" aria-label="stunden">
          <span class="input-group-text">Std/Woche</span>
        </div>
      </div>
      <div class="col-4">&nbsp;</div>
      <gueltigkeit ref="gueltigkeit" :config="getgueltigkeit" @markended="markGBsEnded"></gueltigkeit>
      <div class="col-1">
        <button v-if="isremoveable" type="button" class="btn-close btn-sm p-2 float-end" @click="removeVB" aria-label="Close"></button>
        <button v-if="isdeleteable" type="button" class="btn btn-sm p-2 float-end" @click="marktodeleteVB" aria-label="Delete"><i class="fas fa-trash"></i></button>
      </div>
    </div>
    <gehaltsbestandteilhelper ref="gbh" v-bind:preset="getgehaltsbestandteile"></gehaltsbestandteilhelper>
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
      stunden: ''
    };
  },
  created: function() {
    this.setDataFromConfig();
  },
  methods: {
    setDataFromConfig: function() {
      if( this.config?.data?.id !== undefined ) {
        this.id = this.config.data.id;
      }
      if( this.config?.data?.stunden !== undefined ) {
        if(!isNaN(this.config.data.stunden)) {
            this.config.data.stunden = this.config.data.stunden.toString();
        }
        this.stunden = this.config.data.stunden.replace('.', ',');
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
          stunden: this.stunden.replace(',', '.'),
          gueltigkeit: this.$refs.gueltigkeit.getPayload(),
        },
        gbs: this.$refs.gbh.getPayload()
      };
    }
  }
}
