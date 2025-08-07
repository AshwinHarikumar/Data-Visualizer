import * as XLSX from 'xlsx';
import { HouseholdData } from '../types';

// Helper to normalize header names for flexible matching
// e.g., "Unit Name" -> "unitname"
const normalizeHeader = (header: string): string => {
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
  
  // houseType
  housetype: 'houseType',

  // houseStructure
  housestructure: 'houseStructure',

  // totalFloorArea
  totalfloorarea: 'totalFloorArea',
  totalfloorareasqft: 'totalFloorArea',
  totalfloorareasqftmifknown: 'totalFloorArea',
  floorarea: 'totalFloorArea',

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
    const num = parseInt(String(value), 10);
    return isNaN(num) ? 0 : num;
}


export const parseExcelFile = (file: File): Promise<HouseholdData[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                if (!data) {
                    throw new Error("File could not be read.");
                }
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

                if (jsonData.length === 0) {
                    throw new Error("The Excel sheet is empty or not formatted correctly.");
                }
                
                // Find the mapping from the actual headers in the file to our data keys
                const fileHeaders = Object.keys(jsonData[0]);
                const fileHeaderMapping: { [key: string]: keyof HouseholdData } = {};
                let foundHeaders = 0;
                
                fileHeaders.forEach(header => {
                    const normalized = normalizeHeader(header);
                    if (headerMapping[normalized]) {
                        fileHeaderMapping[header] = headerMapping[normalized];
                        foundHeaders++;
                    }
                });

                if (foundHeaders < 5) { // Increased threshold for better validation
                    throw new Error("Could not map Excel columns. Please ensure headers like 'Name', 'House Type', etc., are present.");
                }

                const mappedData: Partial<HouseholdData>[] = jsonData.map(row => {
                    const newRow: Partial<HouseholdData> = {};
                    for (const header in fileHeaderMapping) {
                        const mappedKey = fileHeaderMapping[header];
                        if (row[header] !== undefined) {
                            (newRow as any)[mappedKey] = row[header];
                        }
                    }
                    return newRow;
                });
                
                const processedData = mappedData.map((row) => {
                     return {
                        unitName: String(row.unitName || ''),
                        name: String(row.name || ''),
                        location: String(row.location || ''),
                        familyMembers: convertToNumber(row.familyMembers),
                        houseType: String(row.houseType || 'N/A'),
                        houseStructure: String(row.houseStructure || 'N/A'),
                        totalFloorArea: convertToNumber(row.totalFloorArea),
                        yearOfConstruction: convertToNumber(row.yearOfConstruction),
                        avgMonthlyBill: convertToNumber(row.avgMonthlyBill),
                        useWindowFilms: convertToBoolean(row.useWindowFilms),
                        hasEnergyEfficientAppliances: convertToBoolean(row.hasEnergyEfficientAppliances),
                        unplugDevicesWhenNotinUse: convertToBoolean(row.unplugDevicesWhenNotinUse),
                        usePowerStrip: convertToBoolean(row.usePowerStrip),
                        cleanRefrigeratorCoils: convertToBoolean(row.cleanRefrigeratorCoils),
                        hasSolarPanels: convertToBoolean(row.hasSolarPanels),
                        cookingFuel: String(row.cookingFuel || 'N/A'),
                    };
                });

                resolve(processedData);

            } catch (error: any) {
                console.error("Error parsing Excel file:", error);
                reject(new Error(error.message || "Failed to parse the Excel file."));
            }
        };

        reader.onerror = (error) => {
            console.error("FileReader error:", error);
            reject(new Error("Failed to read the file."));
        };

        reader.readAsArrayBuffer(file);
    });
};