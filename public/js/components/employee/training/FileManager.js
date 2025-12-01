import FormUploadDms from '../../../../../../../public/js/components/Form/Upload/Dms.js';

export const FileManager = {
	name: 'FileManager',
    components: {
        "datepicker": VueDatePicker,
       // "FileUpload": primevue.fileupload,
        FormUploadDms
    },
    props: {
        modelValue: { type: Object },
    },  
    expose: [ 'submit', 'reset'],
    emits: ['update:modelValue','submit'],
    setup(props, { emit }) {

        const { watch, ref, inject, toRefs, onMounted, defineExpose, toRaw, reactive } = Vue; 

        //const fileData = ref([]);

        const onAdvancedUpload = () => {
        };

        // debug changes
        watch(() => props.modelValue.fileData,(newVal, oldVal) => {
            console.log(newVal);
        })

        const update = (field, value) => {
            // create new object, props are read-only
            emit('update:modelValue', { ...props.modelValue, [field]: value })
        }

        const submit = () => {
            //if (validate()) {
                console.log('file submit pressed')
                emit('submit', props.modelValue)
            //}
        }

        return { onAdvancedUpload, submit, update }

    },    
    template: `
         <div class="card">
            <form class="row g-3" ref="filemanagerFrm" id="filemanagerFrm" @submit.prevent="submit">
                <FormUploadDms 
                    ref="upload" id="file" 
                    multiple 
                    :model-value="modelValue.fileData"
                    @update:modelValue="update('fileData', $event)"
                    ></FormUploadDms>
            </form>
            
        </div>
    `
}