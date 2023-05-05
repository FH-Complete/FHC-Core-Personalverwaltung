export default {     
     setup( props, { slots } ) {  
        const stepTitles = Vue.ref(slots.default().map((step) => step.props.title))
        const selectedTitle = Vue.ref(stepTitles.value[0])
        const selectStep = (title) => { selectedTitle.value = title }
        const reset = () => selectedTitle.value = stepTitles.value[0];
        Vue.provide("selectedTitle", selectedTitle)
        Vue.defineExpose({ selectedTitle, selectStep })

        return { selectedTitle, stepTitles, selectStep, reset }
     },
     template: `
     <div class="steps">
        <slot></slot>
     </div>
     `
}     