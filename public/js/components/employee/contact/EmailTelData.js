const EmailTelData = {
    props: {
        editMode: { type: Boolean, required: true },
        personID: { type: Number, required: true },
        writePermission: { type: Boolean, required: false },
    },  
    setup() {
        const generateContactDataEndpointURL = (person_id) => {
            let full =
                (location.port == "3000" ? "https://" : location.protocol) +
                "//" +
                location.hostname +
                ":" +
                (location.port == "3000" ? 8080 : location.port); // hack for dev mode
            return `${full}/index.ci.php/extensions/FHC-Core-Personalverwaltung/api/personContactData?person_id=${person_id}`;
        };
    },
    template: `
        <div class="table-responsive">
            <table class="table table-striped table-sm">
                <thead>
                <tr>
                    <th scope="col">Typ</th>
                    <th scope="col">Kontakt</th>
                    <th scope="col">Zustellung</th>
                    <th scope="col">Anmerkung</th>
                    <th scope="col">Firma</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>email</td>
                    <td>random</td>
                    <td>data</td>
                    <td>placeholder</td>
                    <td>text</td>
                    <td style="text-align: right;">
                        <div class="btn-group" role="group" >
                            <button type="button" class="btn btn-secondary btn-sm">
                            <i class="fa fa-pen-to-square"></i>
                            </button>
                            <button type="button" class="btn btn-danger btn-sm">
                            <i class="fa fa-trash-alt"></i>
                            </button>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td>mobil</td>
                    <td>placeholder</td>
                    <td>irrelevant</td>
                    <td>visual</td>
                    <td>layout</td>
                    <td style="text-align: right;">
                        <div class="btn-group" role="group" >
                            <button type="button" class="btn btn-secondary btn-sm">
                            <i class="fa fa-pen-to-square"></i>
                            </button>
                            <button type="button" class="btn btn-danger btn-sm">
                            <i class="fa fa-trash-alt"></i>
                            </button>
                        </div>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
    `
}