
import { GoogleGenAI, Type } from "@google/genai";
import { HouseholdData } from '../types';

const ocrData = `
==Start of OCR for page 1==
Unit 
Name Name Location
Number 
of Family 
Members
House 
Type
House 
Structure
: 
Total 
Floor 
Area (sq. 
ft/m², if 
known): 
Year of 
Construc
tion: 
Avemariy
a
Priya 
Sathu
Vadakku
mthara(h)
Karighath
uruth 
konghorp
pily po 3 owned 2BHK 600 2004
Avemaria Mini Paul
Pullayil(H)
,Karunga
m 
Thuruth,K
ongorpilly 
PO,Ernak
ulam 3 Owned 2BHK 850 2020
Haritham
Preetha 
Suresh
KUDILIN
GAL 
HOUSE 
MANJALI 
,MATTUP
URAm 2 owned 2BHK 850 2015
Ave Maria Laisa
Karikasse
ry 
(H),Karing
athuruthu 3 Owned
3BHK or 
more 950 2010
Nanma 
Rice 
value 
addition 
unit
Vanaja 
YM
Palaath 
(H) 
Mannam 
P O 
Paravur 5 Owned
3BHK or 
more 720 2019
Kerala 
Food 
Products
Bindu 
Sanilkum
ar
Bindu 
Sanilkum
ar,Thayatt
uparmbu 
(H) 
Nayaramb
alam 2 Owned
3BHK or 
more 520 1965
==End of OCR for page 1==
==Start of OCR for page 2==
Njarackal 
Seashore
Saritha 
Raju
Saritha 
Raju,Pote
nteparam
bil (H) 
Seashore 
Colony 
Aaratuvaz
hi 
Njarackal
3 Owned
3BHK or 
more 650 2017
Njarackal 
Seashore
Shaila 
Anil
shaila 
anil,njarac
kal 
seashore 
colony
4 Owned
3BHK or 
more 700 2008
Ave Maria
Susy 
Sebastian
Mulloor 
(H) 
Chengoth
ukunnu 
Kongorpill
y P O 
Koonanm
avu,Ernak
ulam
2 Owned
3BHK or 
more 1500 2000
==End of OCR for page 2==
==Start of OCR for page 24==
Consume
r Number
Type of 
connecti
on 1- 
Single 2 -
Three
What is 
your 
average 
monthly 
electricit
y bill? (in 
Rupees)
Do you 
use 
reflective 
window 
films to 
reduce 
heat
1.16E+10
Single 
Phase 1200 no
1.16E+12
Single 
Phase 1000 Yes
1.16E+12
Single 
Phase 963 yes
1.16E+12
Single 
Phase 550 no
Single 
Phase 1000 yes
1.16E+12
Single 
Phase 280 no
==End of OCR for page 24==
==Start of OCR for page 25==
1.16E+12
Single 
Phase 1500 no
1.16E+12
Single 
Phase 1200 yes
1.16E+12
Single 
Phase 8000 no
==End of OCR for page 25==
==Start of OCR for page 231==
Do you 
check 
and fix 
leaking 
taps 
regularly
? Yes-1, 
N0-2
Do you 
wash 
clothes 
in cold 
water? 
Yes-1, N0-
2
Source of 
water
Do you 
have 
energy efficient 
(BEE 
star) 
appliance
s? Yes-1, 
N0-2
Do you 
unplug 
devices 
when not 
in use? 
Yes-1, N0-
2
Do you 
use a 
power 
strip for 
multiple 
devices? 
Do you 
clean 
refrigerat
or coils 
and fans 
regularly 
to 
improve 
efficiency
? 
Do you 
have 
solar 
panels 
installed
? 
1 1 Pipeline 1 Yes no yes no
1 1
Bottled 
water 1 Yes no yes no
1 1 Pipeline 1 Yes Yes Yes No
1 1 yes yes yes yes no
1 1 borrowell Yes yes yes yes no
1 1 no 1 2 yes no
==End of OCR for page 231==
==Start of OCR for page 232==
1 1 Pipeline Yes 1 2 yes no
1 1 Pipeline 1 1 no yes no
1 1 Pipeline 2 1 1 yes no
==End of OCR for page 232==
==Start of OCR for page 254==
What all 
fuels are 
used for 
cooking . 
Pl 
provide 
their 
usage 
time
LPG
LPG
LPG
LPG
LPG
LPG
==End of OCR for page 254==
==Start of OCR for page 255==
LPG
LPG and 
hearth
LPG
==End of OCR for page 255==
`;

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      unitName: { type: Type.STRING, description: 'Name of the unit' },
      name: { type: Type.STRING, description: 'Name of the resident' },
      location: { type: Type.STRING, description: 'Location of the residence' },
      familyMembers: { type: Type.INTEGER, description: 'Number of family members' },
      houseType: { type: Type.STRING, description: 'Type of house (e.g., Owned, Rented)' },
      houseStructure: { type: Type.STRING, description: 'House structure (e.g., 2BHK)' },
      totalFloorArea: { type: Type.INTEGER, description: 'Total floor area in sq. ft.' },
      yearOfConstruction: { type: Type.INTEGER, description: 'Year the house was built' },
      avgMonthlyBill: { type: Type.INTEGER, description: 'Average monthly electricity bill in Rupees' },
      useWindowFilms: { type: Type.BOOLEAN, description: 'Whether they use reflective window films' },
      hasEnergyEfficientAppliances: { type: Type.BOOLEAN, description: 'Whether they have BEE star rated appliances' },
      unplugDevicesWhenNotinUse: { type: Type.BOOLEAN, description: 'Whether they unplug devices when not in use' },
      usePowerStrip: { type: Type.BOOLEAN, description: 'Whether they use a power strip for multiple devices' },
      cleanRefrigeratorCoils: { type: Type.BOOLEAN, description: 'Whether they clean refrigerator coils regularly' },
      hasSolarPanels: { type: Type.BOOLEAN, description: 'Whether they have solar panels installed' },
      cookingFuel: { type: Type.STRING, description: 'Primary fuel used for cooking' },
    },
    required: [
      "unitName", "name", "location", "familyMembers", "houseType", 
      "houseStructure", "totalFloorArea", "yearOfConstruction", 
      "avgMonthlyBill", "useWindowFilms", "hasEnergyEfficientAppliances",
      "unplugDevicesWhenNotinUse", "usePowerStrip", "cleanRefrigeratorCoils",
      "hasSolarPanels", "cookingFuel"
    ]
  }
};


export const processOcrData = async (): Promise<HouseholdData[]> => {
  const prompt = `
    Parse the following OCR text from a multi-page survey document. The data for each respondent is split across multiple tables on different pages, but the rows correspond to each other in order. 
    Merge the data for each respondent into a single JSON object. The final output should be an array of these JSON objects.
    Clean the data: fix typos, remove newlines within fields.
    Convert values to their correct types: numbers for numerical fields, and booleans for yes/no fields (Yes/1=true, No/2=false).
    For the field 'houseStructure', if the value is '3BHK or more', keep it as is.
    Ensure the output strictly follows the provided JSON schema.
    Here is the OCR data:
    ${ocrData}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const jsonText = response.text.trim();
    const data = JSON.parse(jsonText);
    return data as HouseholdData[];
  } catch (error) {
    console.error("Error processing data with Gemini API:", error);
    throw new Error("Failed to parse data from images. Please check the console for details.");
  }
};
