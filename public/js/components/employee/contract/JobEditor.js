

export const JobEditor = {
    components: {
 
    },
    props: {
        editMode: { type: Boolean, required: true },
        personID: { type: Number, required: true },
        personUID: { type: String, required: true },
        writePermission: { type: Boolean, required: false },
        //currentValue: { type: Object, required: true },
    },
    setup( props ) {



    },
    template: `
    <table class="table">
        <thead>
            <tr>
                <th scope="col">Zeitraum</th>
                <th scope="col">Typ</th>
                <th scope="col">Zuordnung</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <th scope="row">1.12.2015-</th>
                <td>Disziplinär</td>
                <td></td>
                <td>
                    <button type="button" class="btn btn-sm btn-outline-secondary">
                        <i class="fa fa-pen"></i>
                    </button><button type="button" class="btn btn-sm btn-outline-secondary">
                        <i class="fa fa-minus"></i>
                    </button>
                </td>
            </tr>
            <tr>
                <th scope="row">1.12.2015-</th>
                <td>Fachlich</td>
                <td></td>
                <td>
                    <button type="button" class="btn btn-sm btn-outline-secondary">
                        <i class="fa fa-pen"></i>
                    </button><button type="button" class="btn btn-sm btn-outline-secondary">
                        <i class="fa fa-minus"></i>
                    </button>
                </td>
            </tr>
            <tr>
                <th scope="row">1.12.2015-</th>
                <td>Std.Kst.</td>
                <td></td>
                <td>
                    <button type="button" class="btn btn-sm btn-outline-secondary">
                        <i class="fa fa-pen"></i>
                    </button><button type="button" class="btn btn-sm btn-outline-secondary">
                        <i class="fa fa-minus"></i>
                    </button>
                </td>
            </tr>
            <tr>
                <th scope="row">1.12.2015-</th>
                <td>OE-Zuordnung</td>
                <td></td>
                <td>
                    <button type="button" class="btn btn-sm btn-outline-secondary">
                        <i class="fa fa-pen"></i>
                    </button><button type="button" class="btn btn-sm btn-outline-secondary">
                        <i class="fa fa-minus"></i>
                    </button>
                </td>
            </tr>
            <tr>
                <th scope="row">1.12.2015-</th>
                <td>LektorIn</td>
                <td></td>
                <td>
                    <button type="button" class="btn btn-sm btn-outline-secondary">
                        <i class="fa fa-pen"></i>
                    </button><button type="button" class="btn btn-sm btn-outline-secondary">
                        <i class="fa fa-minus"></i>
                    </button>
                </td>
            </tr>
            
        </tbody>
    </table>
    `
}