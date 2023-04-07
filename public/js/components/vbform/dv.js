import presetable from '../../mixins/vbform/presetable.js';
import dienstverhaeltnis from './dienstverhaeltnis.js';
import store from './vbsharedstate.js';

export default {
  template:`
    <div class="row g-2 py-2 border-bottom mb-3">
      <dienstverhaeltnis ref="formheader" :config="data"></dienstverhaeltnis>
    </div>
  `,
  components: {
    'dienstverhaeltnis': dienstverhaeltnis
  },
  mixins: [
    presetable
  ],
  data: function() {
    return {
      store: store,
      data: {}
    }
  },
  created: function() {
    this.data = this.store.getDV();
  },
  methods: {
    getPayload: function() {
      this.store.setDV(this.$refs.formheader.getPayload());
      return JSON.parse(JSON.stringify(this.preset));
    }
  }
}
