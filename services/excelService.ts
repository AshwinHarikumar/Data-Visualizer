import { HouseholdData } from '../types';

// Helper to normalize header names for flexible matching
// e.g., "Unit Name" -> "unitname"
const normalizeHeader = (header: string): string => {
  if (!header) return '';
  return header.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
};

// Map of normalized headers to the actual keys of HouseholdData
const headerMapping: { [key: string]: keyof HouseholdData } = {
  // unitName
  unitname: 'unitName',

  // name
  name: 'name',

  // location
  location: 'location',

  // familyMembers
  familymembers: 'familyMembers',
  numberoffamilymembers: 'familyMembers',
  familysize: 'familyMembers',
  howmanyperson: 'familyMembers',
  persons: 'familyMembers',
  residents: 'familyMembers',
  
  // houseType
  housetype: 'houseType',

  // houseStructure
  housestructure: 'houseStructure',

  // totalFloorArea
  totalfloorarea: 'totalFloorArea',
  totalfloorareasqft: 'totalFloorArea',
  totalfloorareasqftmifknown: 'totalFloorArea',
  floorarea: 'totalFloorArea',
  sqbuilding: 'totalFloorArea',
  buildingsqft: 'totalFloorArea',
  areasqft: 'totalFloorArea',

  // yearOfConstruction
  yearofconstruction: 'yearOfConstruction',
  constructionyear: 'yearOfConstruction',
  yearbuilt: 'yearOfConstruction',
  
  // avgMonthlyBill
  avgmonthlybill: 'avgMonthlyBill',
  averagemonthlyelectricitybill: 'avgMonthlyBill',
  whatisyouraveragemonthlyelectricitybillinrupees: 'avgMonthlyBill',
  monthlybill: 'avgMonthlyBill',
  electricitybill: 'avgMonthlyBill',
  billamount: 'avgMonthlyBill',

  // avgMonthlyWaterBill
  avgmonthlywaterbill: 'avgMonthlyWaterBill',
  waterbill: 'avgMonthlyWaterBill',
  averagemonthlywaterbill: 'avgMonthlyWaterBill',
  monthlywaterbill: 'avgMonthlyWaterBill',
  waterexpense: 'avgMonthlyWaterBill',

  // avgMonthlyVehicleCost
  avgmonthlyvehiclecost: 'avgMonthlyVehicleCost',
  vehiclecost: 'avgMonthlyVehicleCost',
  transportationcost: 'avgMonthlyVehicleCost',
  fuelcost: 'avgMonthlyVehicleCost',
  avgmonthlytransportationcost: 'avgMonthlyVehicleCost',
  monthlyvehiclecost: 'avgMonthlyVehicleCost',
  vehicleexpense: 'avgMonthlyVehicleCost',

  // useWindowFilms
  usewindowfilms: 'useWindowFilms',
  doyouusereflectivewindowfilmstoreduceheat: 'useWindowFilms',
  reflectivewindowfilms: 'useWindowFilms',

  // hasEnergyEfficientAppliances
  hasenergyefficientappliances: 'hasEnergyEfficientAppliances',
  doyouhaveenergyefficientbeestarappliancessyes1no2: 'hasEnergyEfficientAppliances',
  doyouhaveenergyefficientbeestarappliancessyes1n02: 'hasEnergyEfficientAppliances', // common OCR mistranslation of O for 0
  energyefficientappliances: 'hasEnergyEfficientAppliances',
  doyouhaveenergysavingappliances: 'hasEnergyEfficientAppliances',

  // unplugDevicesWhenNotinUse
  unplugdeviceswhennotinuse: 'unplugDevicesWhenNotinUse',
  doyouunplugdeviceswhennotinuseyes1no2: 'unplugDevicesWhenNotinUse',
  doyouunplugdeviceswhennotinuseyes1n02: 'unplugDevicesWhenNotinUse', // common OCR mistranslation of O for 0
  doyouswitchofflightsfanswhennotinuseyes1no2: 'unplugDevicesWhenNotinUse',
  doyouswitchofflightsfanswhennotinuse: 'unplugDevicesWhenNotinUse',
  switchofflightsfans: 'unplugDevicesWhenNotinUse',
  
  // usePowerStrip
  usepowerstrip: 'usePowerStrip',
  doyouuseapowerstripformultipledevices: 'usePowerStrip',
  powerstrip: 'usePowerStrip',

  // cleanRefrigeratorCoils
  cleanrefrigeratorcoils: 'cleanRefrigeratorCoils',
  doyoucleanrefrigeratorcoilsandfansregularlytoimproveefficiency: 'cleanRefrigeratorCoils',
  cleanfridgecoils: 'cleanRefrigeratorCoils',

  // hasSolarPanels
  hassolarpanels: 'hasSolarPanels',
  doyouhavesolarpanelsinstalled: 'hasSolarPanels',
  solarpanels: 'hasSolarPanels',
  solarpanelinstalled: 'hasSolarPanels',

  // cookingFuel
  cookingfuel: 'cookingFuel',
  whatallfuelsareusedforcookingplprovidetheirusagetime: 'cookingFuel',
  whatallfuelsareusedforcooking: 'cookingFuel',
  fuelusedforcooking: 'cookingFuel',
  fuelsforcooking: 'cookingFuel',
};

const convertToBoolean = (value: any): boolean => {
    if (typeof value === 'boolean') {
        return value;
    }
    if (typeof value === 'string') {
        const lowerValue = value.toLowerCase().trim();
        return lowerValue === 'yes' || lowerValue === 'true' || lowerValue === '1';
    }
    if (typeof value === 'number') {
        return value === 1;
    }
    return false;
};

const convertToNumber = (value: any): number => {
    if (value === null || value === undefined) return 0;
    const num = Number(String(value).replace(/[^0-9.-]+/g,""));
    return isNaN(num) ? 0 : num;
}

export const normalizeData = (jsonData: any[]): HouseholdData[] => {
    if (!Array.isArray(jsonData)) {
        console.error("Normalization failed: provided data is not an array.", jsonData);
        throw new Error("Provided data is not an array.");
    }
    
    return jsonData.map((rawRow) => {
        const newRow: Partial<HouseholdData> = {};
        for (const rawKey in rawRow) {
            const normalizedKey = normalizeHeader(rawKey);
            const mappedKey = headerMapping[normalizedKey] || rawKey as keyof HouseholdData;
            if (mappedKey) {
                (newRow as any)[mappedKey] = rawRow[rawKey];
            }
        }
        
        return {
            unitName: String(newRow.unitName || ''),
            name: String(newRow.name || ''),
            location: String(newRow.location || ''),
            familyMembers: convertToNumber(newRow.familyMembers),
            houseType: String(newRow.houseType || 'N/A'),
            houseStructure: String(newRow.houseStructure || 'N/A'),
            totalFloorArea: convertToNumber(newRow.totalFloorArea),
            yearOfConstruction: convertToNumber(newRow.yearOfConstruction),
            avgMonthlyBill: convertToNumber(newRow.avgMonthlyBill),
            avgMonthlyWaterBill: convertToNumber(newRow.avgMonthlyWaterBill),
            avgMonthlyVehicleCost: convertToNumber(newRow.avgMonthlyVehicleCost),
            useWindowFilms: convertToBoolean(newRow.useWindowFilms),
            hasEnergyEfficientAppliances: convertToBoolean(newRow.hasEnergyEfficientAppliances),
            unplugDevicesWhenNotinUse: convertToBoolean(newRow.unplugDevicesWhenNotinUse),
            usePowerStrip: convertToBoolean(newRow.usePowerStrip),
            cleanRefrigeratorCoils: convertToBoolean(newRow.cleanRefrigeratorCoils),
            hasSolarPanels: convertToBoolean(newRow.hasSolarPanels),
            cookingFuel: String(newRow.cookingFuel || 'N/A'),
        };
    });
};