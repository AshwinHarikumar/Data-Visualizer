
export interface HouseholdData {
  unitName: string;
  name: string;
  location: string;
  familyMembers: number;
  houseType: string;
  houseStructure: string;
  totalFloorArea: number;
  yearOfConstruction: number;
  avgMonthlyBill: number;
  avgMonthlyWaterBill: number;
  avgMonthlyVehicleCost: number;
  useWindowFilms: boolean;
  hasEnergyEfficientAppliances: boolean;
  unplugDevicesWhenNotinUse: boolean;
  usePowerStrip: boolean;
  cleanRefrigeratorCoils: boolean;
  hasSolarPanels: boolean;
  cookingFuel: string;
  // Utility & Household Details
consumerNumber: string;
connectionType: string;
waterSource: string;
solarPanelCapacity: number;
energyEfficientAppliancesDetails: string;

// Energy & Water Saving Habits
switchOffWhenNotInUse: boolean;
useDaylight: boolean;
waterHeatingMethod: string;
useBucketBathing: boolean;
fixLeakingTaps: boolean;
washClothesInColdWater: boolean;
clothesDryingMethod: string;
ironingFrequency: string;

// Attitudes & Awareness
awareOfSolarSubsidy: boolean;
preferEnergySavingAppliances: boolean;
biggestElectricityConcern: string;
interestedInEnergyTips: boolean;
additionalComments: string;

// Cooking Details
lpgCylindersPerMonth: number;
cookingElectricityKwhPerMonth: number;
otherCookingFuels: string;
cookingAppliances: string;
cookingTimeBreakfastHours: number;
cookingTimeLunchHours: number;
cookingTimeDinnerHours: number;

// Vehicle Details
numTwoWheelers: number;
numCars: number;
numElectricVehicles: number;
vehicleFuelType: string;
twoWheelerFuelConsumptionLiters: number;
carFuelConsumptionLiters: number;
twoWheelerDistanceKm: number;
carDistanceKm: number;
  
}

// Generic data types for flexible data handling
export type GenericDataRow = Record<string, any>;
export type GenericDataset = GenericDataRow[];

// Data type detection and classification
export interface DataColumnInfo {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'unknown';
  uniqueValues?: any[];
  hasNullValues?: boolean;
  isNumerical?: boolean;
  isCategorical?: boolean;
}

export interface DatasetMetadata {
  columns: DataColumnInfo[];
  rowCount: number;
  dataType: 'household' | 'generic';
  suggestedChartTypes: ChartType[];
}

export type ChartType = 'pie' | 'bar' | 'line' | 'scatter';

// Chart configuration for any data type
export interface ChartConfig {
  type: ChartType;
  xAxis?: string;
  yAxis?: string;
  groupBy?: string;
  aggregationType?: 'count' | 'sum' | 'average' | 'min' | 'max';
  colorScheme?: string[];
}