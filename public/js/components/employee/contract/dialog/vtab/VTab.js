export default {
    props: {
        title: {
          type: String,
          default: 'Tab'
        }
      },
    setup() {
      const selectedTitle = Vue.inject("selectedTitle")
      return {
        selectedTitle
      }
    },
    template: `
        <div class="vtab-content" v-show="title == selectedTitle">
            <slot/>
        </div>
      `
}