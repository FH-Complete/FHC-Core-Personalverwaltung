import presetable from '../../mixins/vbform/presetable.js';
import dv from './dv.js';

export default {
  template: `
  <div class="row">
    <div class="col-2">
        &nbsp;
    </div>

    <div class="col-10">
      <div class="w-100 px-3">
        <template v-for="(child, idx) in children">
          <component ref="parts" :is="child.type" :key="idx" :preset="child"></component>
        </template>
      </div>
    </div>
  </div>
  `,
  components: {
    "dv": dv
  },
  mixins: [
    presetable
  ],
  methods: {
    getPayload: function() {
      var children = [];
      for( var i in this.$refs.parts ) {
        children.push(this.$refs.parts[i].getPayload());
      }
      var guioptions = JSON.parse(JSON.stringify(this.preset.guioptions));
      var payload = {
        "type": "tabsspacer",
        "guioptions": guioptions,
        "children": children
      };
      return payload;
    }
  }
}
