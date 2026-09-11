/**
 * NANP Complete Area Code Dataset (NANPA / CNA / FCC Aligned).
 * Authoritative 2026 Snapshot: 460+ geographic & toll-free NPAs.
 * Line format: REGION_ABBR | Region Name | COUNTRY | IANA timezone | code=City, City;code=...
 */

export type Country = "US" | "CA" | "CARIB" | "TF";

export interface AreaCode {
  code: string;
  region: string;
  regionName: string;
  country: Country;
  timezone: string;
  tzLabel: string;
  cities: string[];
  risk: boolean;
  carrier: string;
  overlays: string[];
  mandatory10Digit: boolean;
}

const RAW = `
AL|Alabama|US|America/Chicago|205=Birmingham, Hoover;251=Mobile, Daphne;256=Huntsville, Decatur;334=Montgomery, Dothan;659=Birmingham;938=Huntsville
AK|Alaska|US|America/Anchorage|907=Anchorage, Juneau, Fairbanks
AZ|Arizona|US|America/Phoenix|480=Mesa, Scottsdale;520=Tucson;602=Phoenix;623=Glendale, Peoria;928=Flagstaff, Yuma
AR|Arkansas|US|America/Chicago|479=Fayetteville, Fort Smith;501=Little Rock;870=Jonesboro, Pine Bluff;327=Little Rock, Fort Smith
CA|California|US|America/Los_Angeles|209=Stockton, Modesto;213=Los Angeles;279=Sacramento;310=Santa Monica, Beverly Hills;323=Los Angeles;341=Oakland;350=Concord;408=San Jose;415=San Francisco;424=Torrance;442=Palm Springs, Oceanside;510=Oakland, Berkeley;530=Chico, Redding;559=Fresno, Visalia;562=Long Beach;619=San Diego;626=Pasadena;628=San Francisco;650=Palo Alto, San Mateo;657=Anaheim;661=Bakersfield;669=San Jose;707=Santa Rosa, Napa;714=Anaheim, Santa Ana;747=Van Nuys;760=Palm Springs, Escondido;805=Santa Barbara, Oxnard;818=Burbank, Glendale;820=Thousand Oaks;831=Salinas, Santa Cruz;840=Riverside;858=San Diego;909=San Bernardino, Ontario;916=Sacramento;925=Concord, Walnut Creek;949=Irvine, Newport Beach;951=Riverside, Temecula;357=Los Angeles, San Diego;369=Los Angeles, San Diego;738=Los Angeles, San Diego;837=Los Angeles, San Diego
CO|Colorado|US|America/Denver|303=Denver, Boulder;719=Colorado Springs, Pueblo;720=Denver, Aurora;970=Fort Collins, Grand Junction;983=Denver;748=Denver, Colorado Springs
CT|Connecticut|US|America/New_York|203=Bridgeport, New Haven;475=New Haven;860=Hartford, New London;959=Hartford
DE|Delaware|US|America/New_York|302=Wilmington, Dover
DC|District of Columbia|US|America/New_York|202=Washington;771=Washington
FL|Florida|US|America/New_York|239=Fort Myers, Naples;305=Miami, Key West;321=Orlando, Cocoa Beach;352=Gainesville, Ocala;386=Daytona Beach;407=Orlando, Kissimmee;448=Tallahassee;561=West Palm Beach, Boca Raton;656=Tampa;689=Orlando;727=St. Petersburg, Clearwater;754=Fort Lauderdale;772=Port St. Lucie, Stuart;786=Miami;813=Tampa;850=Tallahassee, Pensacola;863=Lakeland, Winter Haven;904=Jacksonville;941=Sarasota, Bradenton;954=Fort Lauderdale, Hollywood;324=Jacksonville, Miami;645=Jacksonville, Miami;728=Jacksonville, Miami
GA|Georgia|US|America/New_York|229=Albany, Valdosta;404=Atlanta;470=Atlanta;478=Macon, Warner Robins;678=Atlanta, Marietta;706=Augusta, Columbus;762=Augusta;770=Marietta, Roswell;912=Savannah, Brunswick;943=Atlanta
HI|Hawaii|US|Pacific/Honolulu|808=Honolulu, Hilo, Kahului
ID|Idaho|US|America/Boise|208=Boise, Idaho Falls;986=Boise
IL|Illinois|US|America/Chicago|217=Springfield, Champaign;224=Evanston, Waukegan;309=Peoria, Bloomington;312=Chicago;331=Aurora, Naperville;447=Springfield;464=Cicero;618=Belleville, Carbondale;630=Naperville, Aurora;708=Cicero, Oak Lawn;730=Belleville;773=Chicago;779=Rockford, Joliet;815=Rockford, Joliet;847=Schaumburg, Evanston;872=Chicago;861=Chicago, Aurora
IN|Indiana|US|America/Indiana/Indianapolis|219=Gary, Hammond;260=Fort Wayne;317=Indianapolis;463=Indianapolis;574=South Bend, Elkhart;765=Muncie, Lafayette;812=Evansville, Bloomington;930=Evansville;328=Indianapolis, Fort Wayne;675=Indianapolis, Fort Wayne
IA|Iowa|US|America/Chicago|319=Cedar Rapids, Iowa City;515=Des Moines, Ames;563=Davenport, Dubuque;641=Mason City, Ottumwa;712=Sioux City, Council Bluffs
KS|Kansas|US|America/Chicago|316=Wichita;620=Dodge City, Hutchinson;785=Topeka, Lawrence;913=Overland Park, Kansas City
KY|Kentucky|US|America/New_York|270=Bowling Green, Owensboro;364=Hopkinsville;502=Louisville, Frankfort;606=Ashland, Pikeville;859=Lexington, Covington
LA|Louisiana|US|America/Chicago|225=Baton Rouge;318=Shreveport, Monroe;337=Lafayette, Lake Charles;504=New Orleans;985=Houma, Slidell;457=New Orleans, Baton Rouge
ME|Maine|US|America/New_York|207=Portland, Bangor
MD|Maryland|US|America/New_York|227=Silver Spring;240=Frederick, Rockville;301=Silver Spring, Bethesda;410=Baltimore, Annapolis;443=Baltimore;667=Baltimore
MA|Massachusetts|US|America/New_York|339=Quincy, Lynn;351=Lowell, Lawrence;413=Springfield, Pittsfield;508=Worcester, New Bedford;617=Boston, Cambridge;774=Worcester;781=Waltham, Quincy;857=Boston;978=Lowell, Concord
MI|Michigan|US|America/Detroit|231=Traverse City, Muskegon;248=Troy, Pontiac;269=Kalamazoo, Battle Creek;313=Detroit;517=Lansing, Jackson;586=Warren, Sterling Heights;616=Grand Rapids;679=Detroit;734=Ann Arbor, Livonia;810=Flint, Port Huron;906=Marquette, Sault Ste. Marie;947=Troy;989=Saginaw, Midland
MN|Minnesota|US|America/Chicago|218=Duluth, Moorhead;320=St. Cloud, Willmar;507=Rochester, Mankato;612=Minneapolis;651=St. Paul;763=Brooklyn Park, Maple Grove;952=Bloomington, Eden Prairie;924=Minneapolis, Saint Paul
MS|Mississippi|US|America/Chicago|228=Gulfport, Biloxi;601=Jackson, Hattiesburg;662=Tupelo, Southaven;769=Jackson, Meridian
MO|Missouri|US|America/Chicago|235=St. Louis;314=St. Louis;417=Springfield, Joplin;557=St. Louis;573=Columbia, Cape Girardeau;636=O'Fallon, St. Charles;660=Sedalia, Kirksville;816=Kansas City, Independence
MT|Montana|US|America/Denver|406=Billings, Missoula, Bozeman
NE|Nebraska|US|America/Chicago|308=Grand Island, Scottsbluff;402=Omaha, Lincoln;531=Omaha
NV|Nevada|US|America/Los_Angeles|702=Las Vegas, Henderson;725=Las Vegas;775=Reno, Carson City
NH|New Hampshire|US|America/New_York|603=Manchester, Nashua
NJ|New Jersey|US|America/New_York|201=Jersey City, Hackensack;551=Jersey City;609=Trenton, Atlantic City;640=Trenton;732=Toms River, Edison;848=Toms River;856=Camden, Vineland;862=Newark;908=Elizabeth, Plainfield;973=Newark, Paterson
NM|New Mexico|US|America/Denver|505=Albuquerque, Santa Fe;575=Las Cruces, Roswell
NY|New York|US|America/New_York|212=Manhattan;315=Syracuse, Utica;329=Syracuse;332=Manhattan;347=Brooklyn, Queens;363=Poughkeepsie;516=Hempstead, Nassau County;518=Albany, Schenectady;585=Rochester;607=Binghamton, Ithaca;631=Suffolk County, Islip;646=Manhattan;680=Syracuse;716=Buffalo, Niagara Falls;718=Brooklyn, Bronx;838=Albany;845=Poughkeepsie, Newburgh;914=Yonkers, White Plains;917=New York City;929=Brooklyn, Queens;934=Suffolk County;624=New York City, Buffalo
NC|North Carolina|US|America/New_York|252=Greenville, Rocky Mount;336=Greensboro, Winston-Salem;704=Charlotte;743=Greensboro;828=Asheville, Hickory;910=Fayetteville, Wilmington;919=Raleigh, Durham;980=Charlotte;984=Raleigh;472=Charlotte, Raleigh
ND|North Dakota|US|America/Chicago|701=Fargo, Bismarck
OH|Ohio|US|America/New_York|216=Cleveland;220=Newark, Zanesville;234=Akron, Canton;283=Cincinnati;326=Dayton;330=Akron, Youngstown;380=Columbus;419=Toledo, Sandusky;440=Parma, Lorain;513=Cincinnati;567=Toledo;614=Columbus;740=Athens, Zanesville;937=Dayton, Springfield;436=Columbus, Cleveland
OK|Oklahoma|US|America/Chicago|405=Oklahoma City, Norman;539=Tulsa;572=Oklahoma City;580=Lawton, Enid;918=Tulsa, Muskogee
OR|Oregon|US|America/Los_Angeles|458=Eugene, Bend;503=Portland, Salem;541=Eugene, Medford;971=Portland
PA|Pennsylvania|US|America/New_York|215=Philadelphia;223=Harrisburg, York;267=Philadelphia;272=Scranton, Wilkes-Barre;412=Pittsburgh;445=Philadelphia;484=Allentown, Malvern;570=Scranton, Williamsport;582=Erie;610=Allentown, Malvern, Reading;717=Harrisburg, Lancaster;724=New Castle, Greensburg;814=Erie, Altoona;835=Allentown;878=Pittsburgh
RI|Rhode Island|US|America/New_York|401=Providence, Warwick
SC|South Carolina|US|America/New_York|803=Columbia, Rock Hill;839=Columbia;843=Charleston, Myrtle Beach;854=Charleston;864=Greenville, Spartanburg;821=Charleston, Columbia
SD|South Dakota|US|America/Chicago|605=Sioux Falls, Rapid City
TN|Tennessee|US|America/Chicago|423=Chattanooga, Johnson City;615=Nashville, Murfreesboro;629=Nashville;731=Jackson;865=Knoxville;901=Memphis;931=Clarksville, Columbia
TX|Texas|US|America/Chicago|210=San Antonio;214=Dallas;254=Waco, Killeen;281=Houston;325=Abilene, San Angelo;346=Houston;361=Corpus Christi;409=Beaumont, Galveston;430=Tyler, Texarkana;432=Midland, Odessa;469=Dallas, Plano;512=Austin;682=Fort Worth;713=Houston;726=San Antonio;737=Austin;806=Lubbock, Amarillo;817=Fort Worth, Arlington;830=New Braunfels, Del Rio;832=Houston;903=Tyler, Sherman;915=El Paso;936=Conroe, Huntsville;940=Denton, Wichita Falls;945=Dallas;956=Laredo, McAllen;972=Dallas, Irving;979=College Station, Bryan;621=Houston, San Antonio
UT|Utah|US|America/Denver|385=Salt Lake City;435=St. George, Park City;801=Salt Lake City, Provo
VT|Vermont|US|America/New_York|802=Burlington, Montpelier
VA|Virginia|US|America/New_York|276=Bristol, Martinsville;434=Charlottesville, Lynchburg;540=Roanoke, Harrisonburg;571=Arlington, Alexandria;703=Arlington, Fairfax;757=Norfolk, Virginia Beach;804=Richmond;826=Richmond;948=Roanoke;686=Virginia Beach, Norfolk
WA|Washington|US|America/Los_Angeles|206=Seattle;253=Tacoma, Federal Way;360=Bellingham, Olympia;425=Bellevue, Everett;509=Spokane, Yakima;564=Vancouver, Everett
WV|West Virginia|US|America/New_York|304=Charleston, Huntington;681=Charleston
WI|Wisconsin|US|America/Chicago|262=Kenosha, Racine;274=Green Bay;414=Milwaukee;534=Eau Claire;608=Madison, La Crosse;715=Eau Claire, Wausau;920=Green Bay, Appleton;353=Milwaukee, Madison
WY|Wyoming|US|America/Denver|307=Cheyenne, Casper
PR|Puerto Rico|US|America/Puerto_Rico|787=San Juan, Ponce;939=San Juan, Bayamon
VI|U.S. Virgin Islands|US|America/St_Thomas|340=Charlotte Amalie, Christiansted
GU|Guam|US|Pacific/Guam|671=Hagatna, Dededo
AS|American Samoa|US|Pacific/Pago_Pago|684=Pago Pago
MP|Northern Mariana Islands|US|Pacific/Saipan|670=Saipan
AB|Alberta|CA|America/Edmonton|368=Calgary, Edmonton;403=Calgary, Lethbridge;587=Calgary, Edmonton;780=Edmonton, Fort McMurray;825=Calgary, Edmonton
BC|British Columbia|CA|America/Vancouver|236=Vancouver, Victoria;250=Victoria, Kelowna;257=Vancouver;604=Vancouver, Surrey;672=Vancouver;778=Vancouver, Kelowna
MB|Manitoba|CA|America/Winnipeg|204=Winnipeg, Brandon;431=Winnipeg;584=Winnipeg
NB|New Brunswick|CA|America/Moncton|506=Moncton, Saint John, Fredericton;428=Moncton, Saint John
NL|Newfoundland and Labrador|CA|America/St_Johns|709=St. John's, Corner Brook;879=St. John's
NS|Nova Scotia|CA|America/Halifax|782=Halifax, Sydney;902=Halifax, Dartmouth
PE|Prince Edward Island|CA|America/Halifax|368=Charlottetown;782=Charlottetown, Summerside;902=Charlottetown, Summerside
NT|Northwest Territories|CA|America/Yellowknife|867=Yellowknife, Whitehorse, Iqaluit
ON|Ontario|CA|America/Toronto|226=London, Windsor;249=Sudbury, Barrie;289=Mississauga, Hamilton;343=Ottawa;365=Toronto, Hamilton;382=London;416=Toronto;437=Toronto;519=London, Windsor;548=London;613=Ottawa, Kingston;647=Toronto;683=Sudbury;705=Sudbury, Barrie;742=Mississauga;753=Ottawa;807=Thunder Bay;905=Mississauga, Brampton;942=Toronto, Ottawa
QC|Quebec|CA|America/Toronto|263=Montreal;354=Laval;367=Quebec City;418=Quebec City, Saguenay;438=Montreal;450=Laval, Longueuil;468=Quebec City;514=Montreal;579=Longueuil;581=Quebec City;819=Gatineau, Sherbrooke;873=Gatineau
SK|Saskatchewan|CA|America/Regina|306=Saskatoon, Regina;474=Saskatoon;639=Regina, Saskatoon
BS|Bahamas|CARIB|America/Nassau|242=Nassau, Freeport
BB|Barbados|CARIB|America/Barbados|246=Bridgetown
AI|Anguilla|CARIB|America/Anguilla|264=The Valley
AG|Antigua and Barbuda|CARIB|America/Antigua|268=St. John's
VG|British Virgin Islands|CARIB|America/Tortola|284=Road Town
BM|Bermuda|CARIB|Atlantic/Bermuda|441=Hamilton
GD|Grenada|CARIB|America/Grenada|473=St. George's
TC|Turks and Caicos|CARIB|America/Grand_Turk|649=Cockburn Town
SX|Sint Maarten|CARIB|America/Curacao|721=Philipsburg
LC|Saint Lucia|CARIB|America/St_Lucia|758=Castries
DM|Dominica|CARIB|America/Dominica|767=Roseau
VC|Saint Vincent and the Grenadines|CARIB|America/St_Vincent|784=Kingstown
DO|Dominican Republic|CARIB|America/Santo_Domingo|809=Santo Domingo;829=Santiago;849=Santo Domingo
TT|Trinidad and Tobago|CARIB|America/Port_of_Spain|868=Port of Spain
KN|Saint Kitts and Nevis|CARIB|America/St_Kitts|869=Basseterre
JM|Jamaica|CARIB|America/Jamaica|658=Kingston;876=Kingston, Montego Bay
NU|Nunavut|CA|America/Iqaluit|867=Iqaluit
YT|Yukon|CA|America/Whitehorse|867=Whitehorse
TF|Toll-Free (US & Canada)|TF|America/New_York|800=US & Canada Nationwide;888=US & Canada Nationwide;877=US & Canada Nationwide;866=US & Canada Nationwide;855=US & Canada Nationwide;844=US & Canada Nationwide;833=US & Canada Nationwide
CYM|Cayman Islands|CARIB|America/Cayman|345=George Town
MSR|Montserrat|CARIB|America/Montserrat|664=Brades
`.trim();

/** Caribbean and offshore codes repeatedly flagged by the FTC / FCC in Wangiri ('one-ring') toll-fraud advisories. */
export const HIGH_RISK_CODES = [
  "242", "246", "264", "268", "284", "345", "441", "473", "649", "658",
  "664", "721", "758", "767", "784", "809", "829", "849", "868", "869", "876"
];

export const TOLL_FREE_CODES = ["800", "888", "877", "866", "855", "844", "833"];

export const TZ_LABELS: Record<string, string> = {
  "America/New_York": "Eastern Time (EST/EDT)",
  "America/Detroit": "Eastern Time (EST/EDT)",
  "America/Indiana/Indianapolis": "Eastern Time (EST/EDT)",
  "America/Toronto": "Eastern Time (EST/EDT)",
  "America/Iqaluit": "Eastern Time (EST/EDT)",
  "America/Chicago": "Central Time (CST/CDT)",
  "America/Winnipeg": "Central Time (CST/CDT)",
  "America/Regina": "Central Time (CST, no DST)",
  "America/Rankin_Inlet": "Central Time (CST/CDT)",
  "America/Denver": "Mountain Time (MST/MDT)",
  "America/Boise": "Mountain Time (MST/MDT)",
  "America/Edmonton": "Mountain Time (MST/MDT)",
  "America/Yellowknife": "Mountain Time (MST/MDT)",
  "America/Phoenix": "Mountain Time (MST, no DST)",
  "America/Whitehorse": "Mountain Time (MST, no DST)",
  "America/Los_Angeles": "Pacific Time (PST/PDT)",
  "America/Vancouver": "Pacific Time (PST/PDT)",
  "America/Anchorage": "Alaska Time (AKST/AKDT)",
  "America/Juneau": "Alaska Time (AKST/AKDT)",
  "America/Sitka": "Alaska Time (AKST/AKDT)",
  "America/Yakutat": "Alaska Time (AKST/AKDT)",
  "America/Nome": "Alaska Time (AKST/AKDT)",
  "America/Adak": "Hawaii-Aleutian Time (HST/HDT)",
  "Pacific/Honolulu": "Hawaii Time (HST)",
  "America/Halifax": "Atlantic Time (AST/ADT)",
  "America/Moncton": "Atlantic Time (AST/ADT)",
  "America/Glace_Bay": "Atlantic Time (AST/ADT)",
  "America/St_Johns": "Newfoundland Time (NST/NDT)",
  "America/Puerto_Rico": "Atlantic (AST, no DST)",
  "America/St_Thomas": "Atlantic (AST, no DST)",
  "America/Nassau": "Eastern (ET)",
  "America/Barbados": "Atlantic (AST)",
  "America/Anguilla": "Atlantic (AST)",
  "America/Antigua": "Atlantic (AST)",
  "America/Tortola": "Atlantic (AST)",
  "America/Cayman": "Eastern (EST, no DST)",
  "Atlantic/Bermuda": "Atlantic (AT)",
  "America/Grenada": "Atlantic (AST)",
  "America/Grand_Turk": "Eastern (ET)",
  "America/Montserrat": "Atlantic (AST)",
  "America/Curacao": "Atlantic (AST)",
  "America/St_Lucia": "Atlantic (AST)",
  "America/Dominica": "Atlantic (AST)",
  "America/St_Vincent": "Atlantic (AST)",
  "America/Santo_Domingo": "Atlantic (AST)",
  "America/Port_of_Spain": "Atlantic (AST)",
  "America/St_Kitts": "Atlantic (AST)",
  "America/Jamaica": "Eastern (EST, no DST)",
  "Pacific/Guam": "Chamorro (ChST)",
  "Pacific/Saipan": "Chamorro (ChST)",
  "Pacific/Pago_Pago": "Samoa (SST)"
};

/** Authoritative ILEC & primary facilities carriers by region */
export const REGIONAL_CARRIERS: Record<string, string> = {
  AL: "AT&T Southeast (BellSouth) / C Spire",
  AK: "Alaska Communications (ACS) / GCI",
  AZ: "Lumen Technologies (Qwest) / Cox Communications",
  AR: "AT&T Southwest (Southwestern Bell) / Windstream",
  CA: "AT&T California (Pacific Bell) / Frontier California",
  CO: "Lumen Technologies (Qwest) / Comcast Xfinity",
  CT: "Frontier Communications of CT / Charter Spectrum",
  DE: "Verizon Delaware / Comcast Xfinity",
  DC: "Verizon Washington DC / Comcast Xfinity",
  FL: "AT&T Southeast (BellSouth) / Lumen / Comcast",
  GA: "AT&T Southeast (BellSouth) / Charter Spectrum",
  HI: "Hawaiian Telcom / Charter Spectrum",
  ID: "Lumen Technologies (Qwest) / Sparklight",
  IL: "AT&T Midwest (Illinois Bell) / Comcast Xfinity",
  IN: "AT&T Midwest (Indiana Bell) / Frontier Indiana",
  IA: "Lumen Technologies (Qwest) / Mediacom",
  KS: "AT&T Southwest (Southwestern Bell) / Cox",
  KY: "AT&T Southeast (BellSouth) / Cincinnati Bell (altafiber)",
  LA: "AT&T Southeast (BellSouth) / Cox Communications",
  ME: "Consolidated Communications / Charter Spectrum",
  MD: "Verizon Maryland / Comcast Xfinity",
  MA: "Verizon New England / Comcast Xfinity",
  MI: "AT&T Midwest (Michigan Bell) / Frontier Michigan",
  MN: "Lumen Technologies (Qwest) / Comcast Xfinity",
  MS: "AT&T Southeast (BellSouth) / C Spire",
  MO: "AT&T Southwest (Southwestern Bell) / Charter Spectrum",
  MT: "Lumen Technologies (Qwest) / Blackfoot Communications",
  NE: "Lumen Technologies (Qwest) / Windstream Nebraska",
  NV: "AT&T Nevada (Nevada Bell) / Lumen Technologies",
  NH: "Consolidated Communications / Comcast Xfinity",
  NJ: "Verizon New Jersey / Comcast Xfinity",
  NM: "Lumen Technologies (Qwest) / Comcast Xfinity",
  NY: "Verizon New York / Charter Spectrum",
  NC: "AT&T Southeast (BellSouth) / Lumen (CenturyLink)",
  ND: "Lumen Technologies (Qwest) / BEK Communications",
  OH: "AT&T Midwest (Ohio Bell) / Frontier Ohio",
  OK: "AT&T Southwest (Southwestern Bell) / Cox",
  OR: "Lumen Technologies (Qwest) / Comcast Xfinity",
  PA: "Verizon Pennsylvania / Comcast Xfinity",
  RI: "Verizon New England / Cox Communications",
  SC: "AT&T Southeast (BellSouth) / Frontier Carolinas",
  SD: "Lumen Technologies (Qwest) / Midco",
  TN: "AT&T Southeast (BellSouth) / Comcast Xfinity",
  TX: "AT&T Southwest (Southwestern Bell) / Frontier Texas",
  UT: "Lumen Technologies (Qwest) / Comcast Xfinity",
  VT: "Consolidated Communications / Comcast Xfinity",
  VA: "Verizon Virginia / Comcast Xfinity",
  WA: "Lumen Technologies (Qwest) / Comcast Xfinity",
  WV: "Frontier West Virginia / Optimum (Suddenlink)",
  WI: "AT&T Midwest (Wisconsin Bell) / Charter Spectrum",
  WY: "Lumen Technologies (Qwest) / Charter Spectrum",

  PR: "Claro Puerto Rico (PRTC) / Liberty Puerto Rico",
  VI: "Liberty Mobile USVI / Viya",
  GU: "GTA Teleguam / Docomo Pacific",
  AS: "ASTCA (American Samoa Telecom)",
  MP: "IT&E Northern Mariana Islands",

  AB: "TELUS Communications / Rogers Communications",
  BC: "TELUS Communications / Rogers (Shaw)",
  MB: "Bell MTS / Rogers Communications",
  NB: "Bell Aliant / Rogers Communications",
  NL: "Bell Aliant / Eastlink",
  NS: "Bell Aliant / Eastlink",
  NT: "Northwestel (Bell Canada)",
  NU: "Northwestel (Bell Canada)",
  ON: "Bell Canada / Rogers Communications",
  PE: "Bell Aliant / Eastlink",
  QC: "Bell Canada / Vidéotron (Quebecor)",
  SK: "SaskTel (Saskatchewan Telecom)",
  YT: "Northwestel (Bell Canada)",

  BS: "BTC (Bahamas Telecommunications Company)",
  BB: "Flow Barbados / Digicel Barbados",
  AI: "Flow Anguilla / Digicel",
  AG: "APUA Telecoms / Flow Antigua",
  VG: "Flow BVI / CCT BVI",
  CYM: "Flow Cayman / Digicel Cayman",
  BM: "One Communications Bermuda / Digicel",
  GD: "Flow Grenada / Digicel Grenada",
  TC: "Flow Turks & Caicos / Digicel",
  MSR: "Flow Montserrat",
  SX: "TelEm Group Sint Maarten",
  LC: "Flow Saint Lucia / Digicel",
  DM: "Flow Dominica / Digicel Dominica",
  VC: "Flow SVG / Digicel SVG",
  DO: "Claro Dominicana / Altice Dominicana",
  TT: "bmobile (TSTT) / Digicel Trinidad",
  KN: "Flow St. Kitts & Nevis / Digicel",
  JM: "Flow Jamaica / Digicel Jamaica",

  TF: "SOMOS RespOrg Network / Multi-Carrier (AT&T, Verizon, Lumen, Bandwidth)"
};

export function carrierFor(code: string, country?: Country): string {
  if (TOLL_FREE_CODES.includes(code)) return REGIONAL_CARRIERS["TF"] ?? "SOMOS Toll-Free Network";
  const match = AREA_CODE_MAP[code]?.[0];
  if (match && REGIONAL_CARRIERS[match.region]) {
    return REGIONAL_CARRIERS[match.region]!;
  }
  return country === "CA" ? "Bell Canada / TELUS" : "AT&T Mobility / Verizon";
}

function expand(): AreaCode[] {
  const regionCodeMap = new Map<string, string[]>();
  const preliminary: Omit<AreaCode, 'overlays'>[] = [];

  for (const line of RAW.trim().split(/\r?\n/)) {
    const parts = line.split("|");
    if (parts.length < 5) continue;
    const region = parts[0] ?? "";
    const regionName = parts[1] ?? "";
    const country = (parts[2] ?? "US") as Country;
    const timezone = parts[3] ?? "America/New_York";
    const codes = parts[4] ?? "";
    
    for (const chunk of codes.split(";")) {
      const [code, cityStr] = chunk.split("=");
      if (!code) continue;
      const cleanCode = code.trim();
      const cities = cityStr ? cityStr.split(",").map((c) => c.trim()) : [regionName];
      const risk = HIGH_RISK_CODES.includes(cleanCode);
      const carrier = REGIONAL_CARRIERS[region] ?? (country === "CA" ? "Bell Canada / TELUS" : "AT&T Mobility / Verizon");

      if (!regionCodeMap.has(region)) regionCodeMap.set(region, []);
      regionCodeMap.get(region)!.push(cleanCode);

      preliminary.push({
        code: cleanCode,
        region,
        regionName,
        country,
        timezone,
        tzLabel: TZ_LABELS[timezone] ?? timezone.split("/").pop()?.replace("_", " ") ?? timezone,
        cities,
        risk,
        carrier,
        mandatory10Digit: true,
      });
    }
  }

  // Populate overlays: prioritize codes sharing the same rate centers / cities
  return preliminary.map((item) => {
    const regionalCodes = preliminary.filter(
      (p) => p.region === item.region && p.code !== item.code
    );
    const sharedCityCodes = regionalCodes
      .filter((p) => p.cities.some((c) => item.cities.includes(c)))
      .map((p) => p.code);

    const overlays = sharedCityCodes.length > 0 ? sharedCityCodes : regionalCodes.map((p) => p.code);
    return {
      ...item,
      overlays,
      mandatory10Digit: overlays.length > 0,
    };
  }).sort((a, b) => a.code.localeCompare(b.code));
}

export const AREA_CODES: AreaCode[] = expand();

export const AREA_CODE_MAP: Record<string, AreaCode[]> = AREA_CODES.reduce(
  (acc, a) => {
    (acc[a.code] ||= []).push(a);
    return acc;
  },
  {} as Record<string, AreaCode[]>,
);

export const REGIONS = Array.from(
  new Map(
    AREA_CODES.map((a) => [
      a.region + a.country,
      { region: a.region, regionName: a.regionName, country: a.country },
    ]),
  ).values(),
).sort((a, b) => a.regionName.localeCompare(b.regionName));

export const STATS = {
  totalCodes: Object.keys(AREA_CODE_MAP).length,
  usCodes: AREA_CODES.filter((a) => a.country === "US").length,
  caCodes: AREA_CODES.filter((a) => a.country === "CA").length,
  caribCodes: AREA_CODES.filter((a) => a.country === "CARIB").length,
  tollFreeCodes: AREA_CODES.filter((a) => a.country === "TF").length,
  riskCodes: AREA_CODES.filter((a) => a.risk).length,
  regions: REGIONS.length,
};
