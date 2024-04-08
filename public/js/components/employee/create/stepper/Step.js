import { inject } from 'vue';

export default {
    props: {
        title: {
          type: String,
          default: 'Step'
        }
      },
    setup() {
      const selectedTitle = inject("selectedTitle")
      return {
        selectedTitle
      }
    },
    template: `
        <div class="step-content" v-show="title == selectedTitle">
            <slot/>
        </div>
      `
}