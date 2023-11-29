import gehaltsbestandteilhelper from './gehaltsbestandteilhelper.js';
import gueltigkeit from './gueltigkeit.js';
import configurable from '../../mixins/vbform/configurable.js';
import errors from './errors.js';
import infos from './infos.js';

export default {
  template: `
  <div class="my-2" :class="canhavegehaltsbestandteile ? 'card card-body' : 'py-0'">
    <div class="py-0">
    <infos :infos="(config?.guioptions?.infos !== undefined) ? config?.guioptions?.infos : []"></infos>
    <errors :errors="(config?.guioptions?.errors !== undefined) ? config?.guioptions?.errors : []"></errors>
    <div class="row g-2 py-2">
      <div class="col-6">
        <select v-model="freitexttyp" :disabled="isinputdisabled('freitexttyp')" class="form-select form-select-sm" aria-label=".form-select-sm example">
          <option value="" selected>Freitexttyp wählen</option>
          <option value="allin">AllIn</option>
          <option value="ersatzarbeitskraft">Ersatzarbeitskraft</option>
          <option value="zusatzvereinbarung">Zusatzvereinbarung</option>
          <option value="befristung">Befristung</option>
          <option value="sonstiges">Sonstiges</option>
        </select>
      </div>
      <div class="col-1">&nbsp;</div>
      <gueltigkeit ref="gueltigkeit" :config="getgueltigkeit" @markended="markGBsEnded"></gueltigkeit>
      <div class="col-1 pe-3">
        <span v-if="db_delete" class="badge bg-danger">wird gelöscht</span>
        <button v-if="isremoveable" type="button" class="btn-close btn-sm p-2 float-end" @click="removeVB" aria-label="Close"></button>        
        <button v-if="isdeleteable" type="button" class="btn btn-sm p-2 float-end" @click="toggledelete" aria-label="Delete"><i v-if="db_delete" class="fas fa-trash-restore"></i><i v-else="" class="fas fa-trash"></i></button>
      </div>
    </div>
    <div class="row g-2 py-2" v-show="showinput('titel')">
      <div class="col-6">
        <input v-model="titel" type="text" class="form-control form-control-sm" placeholder="Titel" aria-label="Titel">
      </div>
      <div class="col-5">&nbsp;</div>
      <div class="col-1">&nbsp;</div>
    </div>
    <div class="row g-2 py-2" v-show="showinput('freitext')">
      <div class="col-6">
        <textarea v-model="freitext" rows="5" class="form-control form-control-sm" placeholder="Freitext" aria-label="Freitext"></textarea>
      </div>
      <div class="col-5">&nbsp;</div>
      <div class="col-1">&nbsp;</div>
    </div>
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
      kuendigungsrelevant: '',
      db_delete: false
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
      if( this.config?.data?.db_delete !== undefined ) {
        this.db_delete = this.config.data.db_delete;
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
          db_delete: this.db_delete,
          gueltigkeit: this.$refs.gueltigkeit.getPayload()
        },
        gbs: this.getGehaltsbestandteilePayload()
      };
    }
  }
}
