import { LatLng } from "../Buildings/SGW/Building";

export class CampusCatalog {
    campuses: Campus[];

    constructor() {
        this.campuses = [];
    }

    addCampus(campus: Campus) {
        this.campuses.push(campus);
    }

    addCampusByData(name: string, center: LatLng, address: string, codename: string) {
        const newCampus = new Campus(name, center, address, codename);
        this.campuses.push(newCampus);
    }
}

export class Campus {
    name: string;
    center: LatLng;
    address: string;
    codename: string;

    constructor(name: string, center: LatLng, address: string, codename: string) {
        this.name = name;
        this.center = center;
        this.address = address;
        this.codename = codename;
    }
}

export const campusCatalog = new CampusCatalog();

export const sgwCampus = new Campus(
    "Sir George Williams Campus",
    {latitude: 45.49711571, longitude: -73.57881003},
    "1455 De Maisonneuve Blvd W, Montreal, QC H3G 1M8, Canada",
    "SGW"
);

export const loyolaCampus = new Campus(
    "Loyola Campus",
    {latitude: 45.4585720638379, longitude: -73.6391689330469},
    "7141 Sherbrooke St W, Montreal, QC H4B 1R6, Canada",
    "LOY"
);

campusCatalog.addCampus(sgwCampus);
campusCatalog.addCampus(loyolaCampus);