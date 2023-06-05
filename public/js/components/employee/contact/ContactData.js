import { AddressData } from "./AddressData.js";
import { EmailTelData } from "./EmailTelData.js";

export const ContactData = {
    components: {
        AddressData,
		EmailTelData,
    },
    props: {
        editMode: { type: Boolean, required: true },
        personID: { type: Number, required: true },
        personUID: { type: String, required: true },
        writePermission: { type: Boolean, required: false },
    },
    setup() {

        // tabs
        const items = ["address", "contact"];
        const activeItem = Vue.ref("address");

        const isActive = (menuItem) => {
            return activeItem.value === menuItem;
        };

        const setActive = (menuItem) => {
            activeItem.value = menuItem;
            console.log("activeItem: ", menuItem);
        };

        return {
            items,
            isActive,
            setActive,
        }
    },
    template: `
        <div class="row pt-md-4">
            <div class="col">
                <div class="card">
                    <div class="card-header">
                        <div class="h5"><h5>Kontaktdaten</h5></div>        
                    </div>
                    <div class="card-body">
                        <div class="col-md-12 d-flex flex-column align-items-start pt-3 pb-2 mb-3">
                            <ul class="nav nav-tabs" style="width: 100%">
                                <li class="nav-item">
                                    <a
                                    class="nav-link"
                                    :class="{ active: isActive(items[0]) }"
                                    @click.prevent="setActive(items[0])"
                                    href="#"
                                    >Adressen</a
                                    >
                                </li>
                                <li class="nav-item">
                                    <a
                                    class="nav-link"
                                    :class="{ active: isActive(items[1]) }"
                                    @click.prevent="setActive(items[1])"
                                    href="#"
                                    >Kontakt</a
                                    >
                                </li>
                            </ul>
                
                            <div class="tab-content py-3" style="width: 100%" id="nav-tabContent">
                            <div
                                class="tab-pane fade"
                                :class="{ 'active show': isActive('address') }"
                                id="nav-address"
                                role="tabpanel"
                                aria-labelledby="nav-home-tab"
                            >
                                <!-- -->
                                <address-data :personID="personID"></address-data>
                                <!-- -->
                            </div>
                            <div
                                class="tab-pane fade"
                                :class="{ 'active show': isActive('contact') }"
                                id="nav-contact"
                                role="tabpanel"
                                aria-labelledby="nav-profile-tab"
                            >
                                <!-- -->
                                <email-tel-data :personID="personID"></email-tel-data>
                                <!-- -->
                            </div>
                        </div>
                        </div>
                    </div> <!--.card-body-->
                </div>
            </div>
        </div>


`

}