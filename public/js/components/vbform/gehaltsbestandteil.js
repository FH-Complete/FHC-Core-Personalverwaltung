import gueltigkeit from './gueltigkeit.js';
import configurable from '../../mixins/vbform/configurable.js';
import errors from './errors.js';
import infos from './infos.js';

export default {
  template: `
  <infos :infos="(config?.guioptions?.infos !== undefined) ? config?.guioptions?.infos : []" :padleft="true"></infos>
  <errors :errors="(config?.guioptions?.errors !== undefined) ? config?.guioptions?.errors : []" :padleft="true"></errors>
  <div class="row pt-2">
    <div class="col-3 ps-5">
      <select v-model="gehaltstyp" :disabled="isinputdisabled('gehaltstyp')" class="form-select form-select-sm" aria-label=".form-select-sm example">
        <option value="" selected disabled>Gehaltstyp wählen</option>
        <option value="basisgehalt">Basisgehalt</option>
        <option value="grundgehalt">Grundgehalt</option>
        <option value="zulage">Zulage</option>
      </select>
    </div>
    <div class="col-2">
      <div class="input-group input-group-sm mb-3">
        <input v-model="betrag" :disabled="isinputdisabled('betrag')" type="text" class="form-control form-control-sm" placeholder="Betrag" aria-label="betrag">
        <span class="input-group-text">&euro;</span>
      </div>
    </div>
    <div class="col-2 form-check form-control-sm">
      <input v-model="valorisierung" :disabled="isinputdisabled('valorisierung')" class="form-check-input" type="checkbox" value="" :id="'valorisierung_' + config.guioptions.id">
      <label class="form-check-label" :for="'valorisierung_' + config.guioptions.id">
        Valorisierung
      </label>
    </div>
    <gueltigkeit ref="gueltigkeit" :config="getgueltigkeit"></gueltigkeit>
    <div class="col-1">
      <button v-if="isremoveable" type="button" class="btn-close btn-sm p-2 float-end" @click="removeGB" aria-label="Close"></button>
    </div>
  </div>
  `,
  data: function() {
    return {
      id: null,
      gehaltstyp : '',
      betrag: '',
      gueltig_ab: '',
      gueltig_bis: '',
      valorisierung: ''
    }
  },
  components: {
    'gueltigkeit': gueltigkeit,
    'infos': infos,
    'errors': errors
  },
  mixins: [
    configurable
  ],
  emits: [
    'removeGB'
  ],
  created: function() {
    this.setDataFromConfig();
  },
  methods: {
    setDataFromConfig: function() {
      if( this.config?.data?.id !== undefined ) {
        this.id = this.config.data.id;
      }
      if( this.config?.data?.gehaltstyp !== undefined ) {
        this.gehaltstyp = this.config.data.gehaltstyp;
      }
      if( this.config?.data?.betrag !== undefined ) {
        this.betrag = this.config.data.betrag;
      }
      if( this.config?.data?.valorisierung !== undefined ) {
        this.valorisierung = this.config.data.valorisierung;
      }
    },
    removeGB: function() {
      this.$emit('removeGB', {id: this.config.guioptions.id});
    },
    getPayload: function() {
      return {
        type: this.config.type,
        guioptions: JSON.parse(JSON.stringify(this.config.guioptions)),
        data: {
          id: this.id,
          gehaltstyp: this.gehaltstyp,
          betrag: this.betrag,
          gueltigkeit: this.$refs.gueltigkeit.getPayload(),
          valorisierung: Boolean(this.valorisierung)
        }
      };
    }
  }
}
