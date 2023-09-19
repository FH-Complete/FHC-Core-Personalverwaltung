import presetable from '../../mixins/vbform/presetable.js';
import dienstverhaeltnis from './dienstverhaeltnis.js';
import store from './vbsharedstate.js';
import errors from './errors.js';
import infos from './infos.js';
import gueltigkeit from './gueltigkeit.js';

export default {
  template:`
    <infos :infos="(dv?.guioptions?.infos !== undefined) ? dv?.guioptions?.infos : []"></infos>
    <errors :errors="(dv?.guioptions?.errors !== undefined) ? dv?.guioptions?.errors : []"></errors>
    <div v-if="store.mode == 'aenderung'" class="row g-2 py-1 border-bottom mb-1 flex-shrink-0 flex-grow-0">
      <div class="col-6 text-end"><strong>Änderungen gelten</strong></div>
      <div class="col-1">&nbsp;</div>
      <gueltigkeit ref="gueltigkeitaenderung" :initialsharedstatemode="'set'" :config="getGueltigkeitsAenderung"></gueltigkeit>
      <div class="col-1">&nbsp;</div>
    </div>
    <div class="row g-2 py-1 border-bottom mb-1 flex-shrink-0 flex-grow-0">
      <dienstverhaeltnis ref="formheader" :config="dv.data"></dienstverhaeltnis>
    </div>
  `,
  components: {
    'dienstverhaeltnis': dienstverhaeltnis,
    'infos': infos,
    'errors': errors,
    'gueltigkeit': gueltigkeit
  },
  mixins: [
    presetable
  ],
  data: function() {
    return {
      store: store,
      dv: {}
    };
  },
  created: function() {
    this.dv = this.store.getDV();
  },
  methods: {
    getPayload: function() {
      if( this.$refs['gueltigkeitaenderung'] ) {
          this.dv.guioptions.gueltigkeitaenderung = this.$refs['gueltigkeitaenderung'].getPayload();
      }
      var payload = {
        type: 'dienstverhaeltnis',
        data: this.$refs.formheader.getPayload(),
        guioptions: JSON.parse(JSON.stringify(this.dv.guioptions))
      };
      this.store.setDV(payload);
      return JSON.parse(JSON.stringify(this.preset));
    }
  },
  computed: {
      getGueltigkeitsAenderung: function() {
          var config = {};
          if( this.dv?.guioptions?.gueltigkeitaenderung !== undefined ) {
              config = this.dv.guioptions.gueltigkeitaenderung;
          }
          return config;
      }
  }
}
