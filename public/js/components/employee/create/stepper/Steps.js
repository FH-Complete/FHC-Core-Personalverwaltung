export default {     
     setup( props, { slots } ) {  
        const stepTitles = Vue.ref(slots.default().map((step) => step.props.title))
        const selectedTitle = Vue.ref(stepTitles.value[0])
        const selectStep = (title) => { selectedTitle.value = title }
        Vue.provide("selectedTitle", selectedTitle)
        Vue.defineExpose({ selectedTitle, selectStep })

        return { selectedTitle, stepTitles, selectStep }
     },
     template: `
     <div class="steps">
        <slot></slot>
     </div>
     `
}     