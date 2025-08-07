interface ApplianceDetails {
  nameForOthers?: string;
  count: number;
  type: 'Ordinary' | 'Energy Efficient';
  capacity?: string; // e.g., "100W", "1.5 Ton"
  avgHoursPerDay: number;
}

export interface HouseholdData {
  // Basic Information
  unitName: string;
  name: string;
  location: string;
  familyMembers: number;
  houseType: string;
  houseStructure: string;
  totalFloorArea?: number; // in sq. ft/m²
  yearOfConstruction?: number;
  consumerNumber?: string;
  connectionType: 'Single' | 'Three-phase';
  avgMonthlyBill: number; // in Rupees
  useReflectiveWindowFilms: boolean;

  // Appliance Details
  ceilingFan: ApplianceDetails;
  light: ApplianceDetails;
  washingMachine: ApplianceDetails;
  mixerGrinder: ApplianceDetails;
  fridge: ApplianceDetails;
  airCooler: ApplianceDetails;
  airConditioner: ApplianceDetails;
  television: ApplianceDetails;
  ironPress: ApplianceDetails;
  mobileCharger: ApplianceDetails;
  waterPump: ApplianceDetails;
  otherAppliance?: ApplianceDetails & { applianceType: string };

  // Energy Saving Habits
  switchOffWhenNotInUse: boolean;
  useDaylight: boolean;
  waterHeatingMethod: string;
  useBucketBathing: boolean;
  fixLeakingTaps: boolean;
  washClothesInColdWater: boolean;
  sourceOfWater: string;
  hasEnergyEfficientAppliances: boolean;
  energyEfficientAppliancesDetails?: string;
  unplugDevicesWhenNotInUse: boolean;
  usePowerStrip: boolean;
  cleanRefrigeratorCoils: boolean;
  hasSolarPanels: boolean;
  solarPanelCapacity?: string; // e.g., "5 kW"
  awareOfSolarSubsidy: boolean;
  preferEnergySavingAppliances: boolean;
  ironUsageFrequency: string;
  clothesDryingMethod: string;

  // Feedback and Concerns
  biggestElectricityConcern: string;
  interestedInEnergySavingTips: boolean;
  additionalComments?: string;

  // Cooking Fuel Details
  cookingFuelsUsed: string;
  lpgCylindersPerMonth?: number;
  electricityForCookingKwhPerMonth?: number;
  otherCookingFuels?: string;
  cookingAppliancesUsed: string;
  cookingHoursBreakfast?: number;
  cookingHoursLunch?: number;
  cookingHoursDinner?: number;

  // Vehicle Details
  twoWheelersCount?: number;
  carsCount?: number;
  electricVehicleCount?: number;
  otherVehiclesCount?: string;
  primaryFuelTypes: string;
  twoWheelerFuelConsumption?: number; // liters/kWh
  carFuelConsumption?: number; // liters/kWh
  otherVehicleFuelConsumption?: number; // liters/kWh
  twoWheelerDistanceKm?: number;
  carDistanceKm?: number;
  otherVehicleDistanceKm?: number;
}
