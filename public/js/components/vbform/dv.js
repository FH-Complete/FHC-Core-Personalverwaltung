import presetable from '../../mixins/vbform/presetable.js';
import dienstverhaeltnis from './dienstverhaeltnis.js';
import store from './vbsharedstate.js';
import errors from './errors.js';
import infos from './infos.js';

export default {
  template:`
    <infos :infos="(dv?.guioptions?.infos !== undefined) ? dv?.guioptions?.infos : []"></infos>
    <errors :errors="(dv?.guioptions?.errors !== undefined) ? dv?.guioptions?.errors : []"></errors>
    <div class="row g-2 py-2 border-bottom mb-3">
      <dienstverhaeltnis ref="formheader" :config="dv.data"></dienstverhaeltnis>
    </div>
  `,
  components: {
    'dienstverhaeltnis': dienstverhaeltnis,
    'infos': infos,
    'errors': errors
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
      var payload = {
        type: 'dienstverhaeltnis',
        data: this.$refs.formheader.getPayload(),
        guioptions: JSON.parse(JSON.stringify(this.dv.guioptions))
      };
      this.store.setDV(payload);
      return JSON.parse(JSON.stringify(this.preset));
    }
  }
}
