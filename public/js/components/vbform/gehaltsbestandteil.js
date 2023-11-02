import gueltigkeit from './gueltigkeit.js';
import configurable from '../../mixins/vbform/configurable.js';
import errors from './errors.js';
import infos from './infos.js';

export default {
  template: `
  <infos :infos="(config?.guioptions?.infos !== undefined) ? config?.guioptions?.infos : []" :padleft="true"></infos>
  <errors :errors="(config?.guioptions?.errors !== undefined) ? config?.guioptions?.errors : []" :padleft="true"></errors>
  <div class="row g-2 mb-1">
    <div class="col-3 ps-5">
      <select v-model="gehaltstyp" :disabled="isinputdisabled('gehaltstyp')" class="form-select form-select-sm" aria-label=".form-select-sm example">
        <option value="" selected disabled>Gehaltstyp wählen</option>
        <option value="basisgehalt">Basisgehalt</option>
        <option value="grundgehalt">Grundgehalt</option>
        <option value="zulage">Zulage</option>
      </select>
    </div>
    <div class="col-2">
      <div class="input-group input-group-sm">
        <input v-model="betrag" :disabled="isinputdisabled('betrag')" type="text" class="form-control form-control-sm" placeholder="Betrag" aria-label="betrag">
        <span class="input-group-text">&euro;</span>
      </div>
    </div>
    <div class="col-2">
      <select v-model="auszahlungen" :disabled="isinputdisabled('auszahlungen')" class="form-select form-select-sm" aria-label=".form-select-sm example">
        <option value="14" selected>14 Auszahlungen</option>
        <option value="12">12 Auszahlungen</option>
      </select>
    </div>
    <gueltigkeit ref="gueltigkeit" :config="getgueltigkeit"></gueltigkeit>
    <div class="col-1">
      <span v-if="db_delete" class="badge bg-danger">wird gelöscht</span>        
      <button v-if="isremoveable" type="button" class="btn-close btn-sm p-2 float-end" @click="removeGB" aria-label="Close"></button>
      <button v-if="isdeleteable" type="button" class="btn btn-sm p-2 float-end" @click="toggledelete" aria-label="Delete"><i v-if="db_delete" class="fas fa-trash-restore"></i><i v-else="" class="fas fa-trash"></i></button>
    </div>
  </div>
  <div class="row g-2 mb-3">
    <div class="col-2 ps-5">&nbsp;</div>
    <div class="col-3">
      <div class="input-group input-group-sm">
        <datepicker v-model="valorisierungssperre" :disabled="isinputdisabled('valorisierungssperre')"
          v-bind:enable-time-picker="false"
          v-bind:placeholder="'Valorisierungssperre bis'"
          six-weeks
          auto-apply 
          locale="de"
          format="dd.MM.yyyy"
          model-type="yyyy-MM-dd"></datepicker>
        <span class="input-group-text bg-white border-0">
            <i class="fas fa-square text-white"></i>
        </span>
      </div>
    </div>
    <div class="col-2 form-check form-control-sm">
      <input v-model="valorisierung" :disabled="isinputdisabled('valorisierung')" class="form-check-input" type="checkbox" value="" :id="'valorisierung_' + config.guioptions.id">
      <label class="form-check-label" :for="'valorisierung_' + config.guioptions.id">
        Valorisierung
      </label>
    </div>
    <div class="col-5">&nbsp;</div>    
  </div>
  `,
  data: function() {
    return {
      id: null,
      gehaltstyp : '',
      betrag: '',
      gueltig_ab: '',
      gueltig_bis: '',
      valorisierung: true,
      valorisierungssperre: null,
      auszahlungen: 14,
      db_delete: false
    };
  },
  components: {
    'gueltigkeit': gueltigkeit,
    'infos': infos,
    'errors': errors,
    "datepicker": VueDatePicker
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
        if(!isNaN(this.config.data.betrag)) {
            this.config.data.betrag = this.config.data.betrag.toString();
        }
        this.betrag = this.config.data.betrag.replace('.', ',');
      }
      if( this.config?.data?.valorisierung !== undefined ) {
        this.valorisierung = this.config.data.valorisierung;
      }
      if( this.config?.data?.valorisierungssperre !== undefined ) {
        this.valorisierungssperre = this.config.data.valorisierungssperre;
      }
      if( this.config?.data?.auszahlungen !== undefined ) {
        this.auszahlungen = this.config.data.auszahlungen;
      }
      if( this.config?.data?.db_delete !== undefined ) {
        this.db_delete = this.config.data.db_delete;
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
          betrag: this.betrag.replace(',', '.'),
          db_delete: this.db_delete,
          gueltigkeit: this.$refs.gueltigkeit.getPayload(),
          valorisierung: Boolean(this.valorisierung),
          valorisierungssperre: this.valorisierungssperre, 
          auszahlungen: this.auszahlungen
        }
      };
    },
    markGBEnded: function() {
        this.$refs['gueltigkeit'].markended();
    }
  }
}
