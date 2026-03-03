import gehaltsbestandteilhelper from './gehaltsbestandteilhelper.js';
import gueltigkeit from './gueltigkeit.js';
import configurable from '../../mixins/vbform/configurable.js';
import errors from './errors.js';
import infos from './infos.js';

export default {
  name: 'VertragsbestandteilLohnguide',
  template: `
  <div class="py-0 my-2">
   <div class="py-0">
    <infos :infos="(config?.guioptions?.infos !== undefined) ? config?.guioptions?.infos : []"></infos>
    <errors :errors="(config?.guioptions?.errors !== undefined) ? config?.guioptions?.errors : []"></errors>
    <div class="row g-2">
      <div class="col-3">
        <div class="input-group input-group-sm mb-3">
          <input v-model="stellenbezeichnung" :disabled="isinputdisabled('stellenbezeichnung')" type="text" class="form-control form-control-sm" placeholder="Stellenbezeichnung" aria-label="stellenbezeichnung">
          <span class="input-group-text">Stellenbezeichnung</span>
        </div>
        <div class="input-group input-group-sm mb-3">
          <input v-model="kommentar_person" :disabled="isinputdisabled('kommentar_person')" type="text" class="form-control form-control-sm" placeholder="Kommentar zur Person" aria-label="kommentar_person">
          <span class="input-group-text">Kommentar zur Person</span>
        </div>
        <div class="input-group input-group-sm mb-3">
          <input v-model="kommentar_modellstelle" :disabled="isinputdisabled('kommentar_modellstelle')" type="text" class="form-control form-control-sm" placeholder="Kommentar zur Modellstelle" aria-label="kommentar_modellstelle">
          <span class="input-group-text">Kommentar zur Modellstelle</span>
        </div>
      </div>
      <div class="col-4">&nbsp;</div>
      <gueltigkeit ref="gueltigkeit" :config="getgueltigkeit" @markended="markGBsEnded"></gueltigkeit>
      <div class="col-1 pe-3">
        <span v-if="db_delete" class="badge bg-danger">wird gelöscht</span>
        <button v-if="isremoveable" type="button" class="btn-close btn-sm p-2 float-end" @click="removeVB" aria-label="Close"></button>
        <button v-if="isdeleteable" type="button" class="btn btn-sm p-2 float-end" @click="toggledelete" aria-label="Delete"><i v-if="db_delete" class="fas fa-trash-restore"></i><i v-else="" class="fas fa-trash"></i></button>
      </div>
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
      stellenbezeichnung: '',
      kommentar_person: '',
      kommentar_modellstelle: '',
      fachbereich_kurzbz: '',
      modellstelle_kurzbz: '',
      db_delete: false
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
      if( this.config?.data?.stellenbezeichnung !== undefined ) {
        this.stellenbezeichnung = this.config.data.stellenbezeichnung;
      }
      if( this.config?.data?.kommentar_person !== undefined ) {
        this.kommentar_person = this.config.data.kommentar_person;
      }
      if( this.config?.data?.kommentar_modellstelle !== undefined ) {
        this.kommentar_modellstelle = this.config.data.kommentar_modellstelle;
      }
      if( this.config?.data?.fachrichtung_kurzbz !== undefined ) {
        this.fachrichtung_kurzbz = this.config.data.fachrichtung_kurzbz;
      }
      if( this.config?.data?.modellstelle_kurzbz !== undefined ) {
        this.modellstelle_kurzbz = this.config.data.modellstelle_kurzbz;
      }  
      if( this.config?.data?.db_delete !== undefined ) {
        this.db_delete = this.config.data.db_delete;
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
          stellenbezeichnung: this.stellenbezeichnung,
          kommentar_modellstelle: this.kommentar_modellstelle,
          kommentar_person: this.kommentar_person,
          fachrichtung_kurzbz: this.fachrichtung_kurzbz,  
          modellstelle_kurzbz: this.modellstelle_kurzbz,
          db_delete: this.db_delete,
          gueltigkeit: this.$refs.gueltigkeit.getPayload(),
        }
      };
    }
  }
}
