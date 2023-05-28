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
    <div class="row g-2 py-2">
      <div class="col-7">
        <select v-model="freitexttyp" :disabled="isinputdisabled('freitexttyp')" class="form-select form-select-sm" aria-label=".form-select-sm example">
          <option value="" selected>Freitexttyp wählen</option>
          <option value="allin">AllIn</option>
          <option value="ersatzarbeitskraft">Ersatzarbeitskraft</option>
          <option value="zusatzvereinbarung">Zusatzvereinbarung</option>
          <option value="befristung">Befristung</option>
          <option value="sonstiges">Sonstiges</option>
        </select>
      </div>
      <gueltigkeit ref="gueltigkeit" :config="getgueltigkeit"></gueltigkeit>
      <div class="col-1">
        <button v-if="isremoveable" type="button" class="btn-close btn-sm p-2 float-end" @click="removeVB" aria-label="Close"></button>        
        <button v-if="isdeleteable" type="button" class="btn btn-sm p-2 float-end" @click="marktodeleteVB" aria-label="Delete"><i class="fas fa-trash"></i></button>
        <button v-if="isendable" type="button" class="btn btn-sm p-2 float-end" @click="endVB" aria-label="End"><i class="fas fa-calendar-times"></i></button>
      </div>
    </div>
    <div class="row g-2 py-2" v-show="showinput('titel')">
      <div class="col-11">
        <input v-model="titel" type="text" class="form-control form-control-sm" placeholder="Titel" aria-label="Titel">
      </div>
      <div class="col-1">&nbsp;</div>
    </div>
    <div class="row g-2 py-2" v-show="showinput('freitext')">
      <div class="col-11">
        <textarea v-model="freitext" rows="5" class="form-control form-control-sm" placeholder="Freitext" aria-label="Freitext"></textarea>
      </div>
      <div class="col-1">&nbsp;</div>
    </div>
    <gehaltsbestandteilhelper ref="gbh" v-if="canhavegehaltsbestandteile" v-bind:preset="getgehaltsbestandteile"></gehaltsbestandteilhelper>
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
  data: function() {
    return {
      id: null,
      freitexttyp: '',
      titel: '',
      freitext: '',
      kuendigungsrelevant: ''
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
      if( this.config?.data?.freitexttyp !== undefined ) {
        this.freitexttyp = this.config.data.freitexttyp;
      }
      if( this.config?.data?.titel !== undefined ) {
        this.titel = this.config.data.titel;
      }
      if( typeof this.config?.data?.freitexttyp !== undefined ) {
        this.freitext = this.config.data.freitext
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
        type: 'vertragsbestandteilfreitext',
        guioptions: this.config.guioptions,
        data: {
          id: this.id,
          freitexttyp: this.freitexttyp,
          titel: this.titel,
          freitext: this.freitext,
          kuendigungsrelevant: this.kuendigungsrelevant,
          gueltigkeit: this.$refs.gueltigkeit.getPayload()
        },
        gbs: this.getGehaltsbestandteilePayload()
      };
    }
  }
}
