export default {     
	name: 'Steps',
     expose: ['selectedTitle', 'selectStep', 'reset'],
     setup( props, { slots } ) {  
        const stepTitles = Vue.ref(slots.default().map((step) => step.props.title))
        const selectedTitle = Vue.ref(stepTitles.value[0])
        const selectStep = (title) => { selectedTitle.value = title }
        const reset = () => selectedTitle.value = stepTitles.value[0];
        Vue.provide("selectedTitle", selectedTitle)

        return { selectedTitle, stepTitles, selectStep, reset }
     },
     template: `
     <nav
        class="nav nav-tabs nav-justified flex-column flex-sm-row ms-sm-auto mt-3 col-lg-12 subnav"
      >
        <slot></slot>
     </nav>
     `
}     