import { Campus, campusCatalog } from "../../campus/Campus";

export type LatLng = {
    latitude: number;
    longitude: number;
};

export class BuildingCatalog{
    buildings: CampusBuilding[];

    constructor(buildings: CampusBuilding[]){
        this.buildings = buildings;
    }

    addBuilding(building: CampusBuilding){
        this.buildings.push(building);
    }

    addBuildingByData(name: string, center: LatLng, address: string, campus: Campus, polygon: LatLng[], numberOfFloors?: number){
        if(numberOfFloors && campus){
        const newBuilding = new CampusBuilding(name, center, address, campus, polygon, numberOfFloors);
        this.buildings.push(newBuilding);
        } else if(campus){
        const newBuilding = new CampusBuilding(name, center, address, campus, polygon);
        this.buildings.push(newBuilding);
        } else {
            console.error("Campus is required to add a building.");
        }
    }
}

export class CampusBuilding{
    name: string;
    center: LatLng;
    address: string;
    campus: Campus;
    polygon: LatLng[];
    numberOfFloors?: number;

    constructor(name: string, center: LatLng, address: string, campus: Campus, polygon: LatLng[], numberOfFloors?: number){
        this.name = name;
        this.center = center;
        this.address = address;
        this.campus = campus;
        this.polygon = polygon;
        if(numberOfFloors){
            this.numberOfFloors = numberOfFloors;
        }
    }
}

export const buildingCatalog = new BuildingCatalog([]);

export const hallBuilding = new CampusBuilding(
    "Hall Building",
    {latitude: 45.4974801225439, longitude: -73.5785245624228},
    "1455 De Maisonneuve Blvd W, Montreal, QC H3G 1M8, Canada",
    campusCatalog.campuses[0],
    [
        {latitude: 45.496829249284595, longitude: -73.57884980943825},
        {latitude: 45.49716390448993, longitude: -73.57954383100119},
        {latitude: 45.497708654988124, longitude: -73.57903421129053},
        {latitude: 45.497372122950125, longitude: -73.57833750751425}
    ],
    13);

export const evBuilding = new CampusBuilding(
    "EV Building",
    {latitude: 45.498231, longitude: -73.579105},
    "1515 De Maisonneuve Blvd W, Montreal, QC H3G 1M8, Canada",
    campusCatalog.campuses[0],
    [   {latitude: 45.495863402752285, longitude: -73.57849587405691},
        {latitude: 45.49559550453038, longitude:  -73.5787625073908},
        {latitude: 45.49522511727483, longitude: -73.5779109060698},
        {latitude: 45.49583146062335, longitude: -73.57724974157962},
        {latitude:45.49604955462382,longitude:-73.57770638763837},
        {latitude:45.495667419542904,longitude:-73.57807250915977}
    ],
    10);

export const dAnnexBuilding = new CampusBuilding(
    "D Annex Building",
    {latitude: 45.497650, longitude: -73.579500},
    "2140 Bishop St, Montreal, QC H3G 2E9, Canada",
    campusCatalog.campuses[0],
    [
        {latitude: 45.49788292487369, longitude: -73.57938415341545},
        {latitude: 45.49762630003951, longitude: -73.5796350034266},
        {latitude: 45.49759713409136, longitude: -73.57957191756631},
        {latitude: 45.497685572726304, longitude: -73.57948802679465},
        {latitude: 45.49769592191919, longitude: -73.57950816057985},
        {latitude: 45.49777171061462, longitude: -73.57943967013365},
        {latitude: 45.497755260091516, longitude: -73.57940278976147},
        {latitude: 45.497849733030286, longitude: -73.57931092410716}
    ],
    5);

/**
 * 45.495863402752285, -73.57849587405691
 * 45.49559550453038, -73.5787625073908
 * 45.49522511727483, -73.5779109060698
 * 45.49583146062335, -73.57724974157962
 * 45.49604955462382, -73.57770638763837
 * 45.495667419542904, -73.57807250915977
 */

buildingCatalog.addBuilding(hallBuilding);
buildingCatalog.addBuilding(evBuilding);
buildingCatalog.addBuilding(dAnnexBuilding);