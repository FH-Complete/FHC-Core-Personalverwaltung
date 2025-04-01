export default {
	name: 'Step',
    props: {
        title: {
          type: String,
          default: 'Step'
        }
      },
    setup() {
      const selectedTitle = Vue.inject("selectedTitle")
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