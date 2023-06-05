import gueltigkeit from './gueltigkeit.js';
import configurable from '../../mixins/vbform/configurable.js';
import errors from './errors.js';
import infos from './infos.js';

export default {
  template: `
  <infos :infos="(config?.guioptions?.infos !== undefined) ? config?.guioptions?.infos : []" :padleft="true"></infos>
  <errors :errors="(config?.guioptions?.errors !== undefined) ? config?.guioptions?.errors : []" :padleft="true"></errors>
  <div class="row g-2">
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
      <span v-if="db_delete" class="badge bg-danger">wird gelöscht</span>        
      <button v-if="isremoveable" type="button" class="btn-close btn-sm p-2 float-end" @click="removeGB" aria-label="Close"></button>
      <button v-if="isdeleteable" type="button" class="btn btn-sm p-2 float-end" @click="toggledelete" aria-label="Delete"><i v-if="db_delete" class="fas fa-trash-restore"></i><i v-else="" class="fas fa-trash"></i></button>
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
      valorisierung: '',
      db_delete: false
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
          betrag: this.betrag,
          db_delete: this.db_delete,
          gueltigkeit: this.$refs.gueltigkeit.getPayload(),
          valorisierung: Boolean(this.valorisierung)
        }
      };
    },
    markGBEnded: function() {
        this.$refs['gueltigkeit'].markended();
    }
  }
}
