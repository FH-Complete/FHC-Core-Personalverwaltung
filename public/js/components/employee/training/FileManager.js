

export const FileManager = {
	name: 'FileManager',
    components: {
        "datepicker": VueDatePicker,
        "FileUpload": primevue.fileupload,
    },
    props: {
    },  
    setup(props) {

        const { watch, ref, inject, toRefs, onMounted, defineExpose, toRaw, reactive } = Vue; 


        const onAdvancedUpload = () => {
        };

        return { onAdvancedUpload }

    },    
    template: `
         <div class="card">
            <FileUpload name="doclist[]" url="/api/upload" @upload="onAdvancedUpload($event)" :multiple="true"  :maxFileSize="1000000">
                <template #empty>
                    <p>Drag and drop files to here to upload.</p>
                </template>
            </FileUpload>
        </div>
    `
}