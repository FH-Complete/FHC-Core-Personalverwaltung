import presetable from '../../mixins/vbform/presetable.js';
import dv from './dv.js';

export default {
  template: `
    <div class="px-3">
      <template v-for="(child, idx) in children" :key="idx">
        <component ref="parts" :is="child.type" :preset="child"></component>
      </template>
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
        "type": "vblistgroupspacer",
        "guioptions": guioptions,
        "children": children
      };
      return payload;
    }
  }
}