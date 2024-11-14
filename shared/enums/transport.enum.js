// shared/enums/transport.enum.ts
export var VehicleType;
(function (VehicleType) {
    VehicleType["VAN"] = "VAN";
    VehicleType["TRUCK_3_5T"] = "TRUCK_3_5T";
    VehicleType["TRUCK_7_5T"] = "TRUCK_7_5T";
    VehicleType["TRUCK_12T"] = "TRUCK_12T";
    VehicleType["SEMI_TRAILER"] = "SEMI_TRAILER";
    VehicleType["MEGA_TRAILER"] = "MEGA_TRAILER";
})(VehicleType || (VehicleType = {}));
export var CargoType;
(function (CargoType) {
    CargoType["GENERAL"] = "GENERAL";
    CargoType["PALLETS"] = "PALLETS";
    CargoType["BULK"] = "BULK";
    CargoType["DANGEROUS"] = "DANGEROUS";
    CargoType["REFRIGERATED"] = "REFRIGERATED";
})(CargoType || (CargoType = {}));
export var TransportStatus;
(function (TransportStatus) {
    TransportStatus["DRAFT"] = "DRAFT";
    TransportStatus["PUBLISHED"] = "PUBLISHED";
    TransportStatus["ASSIGNED"] = "ASSIGNED";
    TransportStatus["IN_PROGRESS"] = "IN_PROGRESS";
    TransportStatus["COMPLETED"] = "COMPLETED";
    TransportStatus["CANCELLED"] = "CANCELLED";
})(TransportStatus || (TransportStatus = {}));
export var LoadingType;
(function (LoadingType) {
    LoadingType["SIDE"] = "SIDE";
    LoadingType["BACK"] = "BACK";
    LoadingType["TOP"] = "TOP";
    LoadingType["CRANE"] = "CRANE";
})(LoadingType || (LoadingType = {}));
