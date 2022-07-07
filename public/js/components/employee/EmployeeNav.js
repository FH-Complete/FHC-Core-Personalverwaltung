export const EmployeeNav = {
    props: {
        personID: Number,
    },
    setup(props, { emit }) {
        const close=() => {
            console.log("close", props.personid)
            emit("close-editor", props.personid)
        }

        const full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;

        return { close, full }
    },
    template: `
    <nav
        class="nav nav-pills flex-column flex-sm-row col-md-9 ms-sm-auto col-lg-12 subnav"
    >
        <a
            class="flex-sm-fill text-sm-center nav-link"
            aria-current="page"
            href="#"
        >Überblick</a
        >
        <a
            class="flex-sm-fill text-sm-center nav-link active"
            :href="full + '/extensions/FHC-Core-Personalverwaltung/Employees?person_id=' + personID"
        >Person</a
        >
        <a
        class="flex-sm-fill text-sm-center nav-link"
        href="#"
        >Verträge</a
        >
        <a
        class="flex-sm-fill text-sm-center nav-link"
        href="#"
        >Gehalt</a
        >
        <a
        class="flex-sm-fill text-sm-center nav-link"
        href="#"
        >Zeiten</a
        >
        <a
        class="flex-sm-fill text-sm-center nav-link"
        href="#"
        >Life Cycle</a
        >
        <a
        class="flex-sm-fill text-sm-center nav-link"
        href="#"
        >Dokumente</a
        >
    </nav>
    
    `
}