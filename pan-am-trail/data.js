// ============ THE PAN-AM TRAIL — static data ============

const TOTAL_KM = 25300;

const MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];

// Region visual + climate configs
const REGIONS = {
  patagonia: { sky:["#4a6a9a","#8ab0d0"], ground:"#7a8a6a", far:"mountains", farC:"#5a6a7a", snowcap:true, mid:"shrub", climate:"cold" },
  lakes:     { sky:["#3a7ab0","#90c8e8"], ground:"#4a7a3a", far:"mountains", farC:"#3a5a4a", snowcap:true, mid:"pine",  climate:"mild" },
  pampas:    { sky:["#50a0d8","#b0e0f0"], ground:"#8aa04a", far:"hills",     farC:"#7a904a", mid:"grass", climate:"mild" },
  atacama:   { sky:["#e89a50", "#f8d090"],ground:"#c89058", far:"dunes",     farC:"#a87038", mid:"cactus", climate:"hot" },
  andes:     { sky:["#38507a","#7a9ac8"], ground:"#8a7a58", far:"peaks",     farC:"#6a6a80", snowcap:true, mid:"shrub", climate:"cold" },
  coast:     { sky:["#48a0c8","#b8e0e8"], ground:"#b8a878", far:"ocean",     farC:"#2878a8", mid:"palm", climate:"mild" },
  jungle:    { sky:["#40a060","#a8d888"], ground:"#2a6a28", far:"hills",     farC:"#1a5028", mid:"palm", climate:"tropical" },
  centralam: { sky:["#48b0c0","#b0e8d0"], ground:"#3a8a38", far:"volcano",   farC:"#4a5a48", mid:"palm", climate:"tropical" },
  mexico:    { sky:["#58a8d0","#c8e0b0"], ground:"#9a8a4a", far:"hills",     farC:"#8a6a3a", mid:"agave", climate:"hot" },
  mexdesert: { sky:["#e8a860","#f8e0a8"], ground:"#d0a068", far:"mesas",     farC:"#b06838", mid:"cactus", climate:"hot" },
  plains:    { sky:["#58a8e0","#c8e8f8"], ground:"#c8b058", far:"flat",      farC:"#a8904a", mid:"grass", climate:"mild" },
  rockies:   { sky:["#4878b0","#a8c8e8"], ground:"#5a7a4a", far:"peaks",     farC:"#5a6a88", snowcap:true, mid:"pine", climate:"cold" },
  boreal:    { sky:["#3a5a88", "#88a8c8"],ground:"#4a6a50", far:"mountains", farC:"#38485a", snowcap:true, mid:"pine", climate:"cold" },
  tundra:    { sky:["#283858","#7898b8"], ground:"#c8d0d8", far:"mountains", farC:"#8898b0", snowcap:true, mid:"snowshrub", climate:"arctic" }
};

const LANDMARKS = [
  { km:0,     name:"Ushuaia, Argentina", region:"patagonia",
    desc:"The End of the World. The sign says so. The only road out goes north — all 25,300 km of it.",
    talk:["A dockworker: \"People sail to Antarctica from here. You're doing something weirder.\"",
          "A woman selling empanadas: \"Eat now. Patagonia is very beautiful and very empty.\""] },
  { km:600,   name:"Río Gallegos, Argentina", region:"patagonia",
    desc:"Wind. So much wind. The gas station coffee is somehow both burnt and cold.",
    talk:["A trucker: \"Hold your lane when the gusts hit. I've seen motorcycles go sideways.\"",
          "A kid: \"You drove here on purpose?\""] },
  { km:1600,  name:"El Chaltén, Argentina", region:"patagonia",
    desc:"Granite spires tear at the clouds. Hikers everywhere compare blisters.",
    talk:["A climber: \"Fitz Roy makes its own weather. So does the road north, honestly.\"",
          "A hosteler: \"Fill your water here. And filter it anyway. Trust nobody's tap.\""] },
  { km:2900,  name:"Bariloche, Argentina", region:"lakes",
    desc:"Chocolate shops, alpine lakes, and the smug feeling of having survived Patagonia.",
    talk:["A chocolatier: \"The lakes district is easy driving. Enjoy it. It ends.\"",
          "A ski bum: \"Altitude sickness is real in the Andes. Coca tea helps. Sleeping helps more.\""] },
  { km:4200,  name:"Santiago, Chile", region:"pampas",
    desc:"A real city with real traffic and real mechanics. Stock up — the desert is next.",
    talk:["A mechanic: \"The Atacama eats tires and radiators. Carry parts.\"",
          "A cyclist: \"Driest desert on Earth ahead. Some weather stations there have never recorded rain.\""] },
  { km:5900,  name:"San Pedro de Atacama, Chile", region:"atacama",
    desc:"Mars, but with hostels. The stars at night are absurd.",
    talk:["An astronomer: \"Clearest skies on the planet. Also, hydrate or die. Mostly hydrate.\"",
          "A tour guide: \"The altiplano crossing to Bolivia is beautiful and it will punish your engine.\""] },
  { km:7300,  name:"La Paz, Bolivia", region:"andes",
    desc:"A city poured into a canyon at 3,600 m. Your lungs file a formal complaint.",
    talk:["A vendor: \"Walk slowly the first two days. Everyone thinks they're the exception.\"",
          "A bus driver: \"They used to call the old Yungas road the Death Road. The new one is fine. Mostly.\""] },
  { km:8800,  name:"Lima, Peru", region:"coast",
    desc:"Fog city on the Pacific. The ceviche is world-class. It is also, statistically, a risk.",
    talk:["A chef: \"Eat where the line is long and local. The empty stall is empty for a reason.\"",
          "A surfer: \"The Pan-Americana hugs the coast for days here. Easy kilometers. Bank them.\""] },
  { km:10300, name:"Quito, Ecuador", region:"andes",
    desc:"Two hemispheres, one city. You straddle the equator line for a photo like everyone else.",
    talk:["A guide: \"You can stand with one foot in each hemisphere. Your GPS will have opinions.\"",
          "A pharmacist: \"Dengue season down in the lowlands. Bug spray is cheaper than a hospital.\""] },
  { km:11700, name:"Medellín, Colombia", region:"jungle",
    desc:"The city of eternal spring. Cable cars climb the green hills. Everyone tells you to try the mango.",
    talk:["A barista: \"Past Turbo the highway just... stops. The Darién. Plan your boat now.\"",
          "A backpacker: \"I met a guy who tried to walk the Gap. He does not recommend it.\""] },
  { km:12200, name:"Turbo, Colombia — the Darién Gap", region:"jungle", darien:true,
    desc:"The road ends. Ahead: 100+ km of roadless jungle, swamp, and the world's most confident snakes.",
    talk:["A boat captain: \"Nobody drives the Gap. Ship the vehicle, sail the islands, or lose everything trying.\"",
          "A ranger: \"The fer-de-lance doesn't rattle. It doesn't warn. It just objects.\""] },
  { km:12600, name:"Panama City, Panama", region:"jungle",
    desc:"Skyscrapers, canal ships, and the sweet, sweet feeling of pavement under your wheels again.",
    talk:["A canal pilot: \"Ships pay six figures to cross here. Your crossing was cheaper. Probably.\"",
          "A taxi driver: \"From here it's bridges and borders all the way to Mexico. Easy. Ish.\""] },
  { km:13500, name:"San José, Costa Rica", region:"centralam",
    desc:"Cloud forests, volcanoes, and sloths that move slower than border bureaucracy. Barely.",
    talk:["A park ranger: \"Pura vida. Also, that volcano is active. The other one too.\"",
          "A zip-line guide: \"Rainy season means landslides on the mountain roads. Check before you climb.\""] },
  { km:14600, name:"Antigua, Guatemala", region:"centralam",
    desc:"Cobblestones, three volcanoes, and coffee that ruins all other coffee forever.",
    talk:["A farmer: \"Volcán de Fuego puffs smoke most days. It's showing off.\"",
          "A student: \"Everyone gets a stomach bug in week two. It's practically a visa stamp.\""] },
  { km:15700, name:"Oaxaca, Mexico", region:"mexico",
    desc:"Mole, mezcal, and markets. Your food budget quietly doubles and nobody regrets it.",
    talk:["A cook: \"Seven kinds of mole. You have time for maybe three. Choose wisely.\"",
          "An artist: \"The topes — speed bumps — will destroy your suspension. They are undefeated.\""] },
  { km:16300, name:"Mexico City, Mexico", region:"mexico",
    desc:"A megacity at 2,240 m built on a drained lake. The traffic has traffic.",
    talk:["A cabbie: \"Twenty-two million people and you brought a vehicle. Brave.\"",
          "An engineer: \"The city sinks a little every year. The tacos are worth the risk.\""] },
  { km:17500, name:"Monterrey & the US Border", region:"mexdesert",
    desc:"Mountains ring the city. Ahead: the border crossing and a truly heroic amount of paperwork.",
    talk:["A customs broker: \"Have every document. Then have copies. Then have copies of the copies.\"",
          "A trucker: \"Once you clear the border it's interstates and gas stations the size of villages.\""] },
  { km:19400, name:"Denver, Colorado, USA", region:"plains",
    desc:"The Mile High City. Your vehicle gets its first oil change that doesn't involve hand gestures.",
    talk:["A barista: \"You drove here from Argentina? That's the second weirdest thing I've heard today.\"",
          "A park ranger: \"Watch for elk in the high passes. They do not watch for you.\""] },
  { km:21000, name:"Calgary, Alberta, Canada", region:"rockies",
    desc:"Cowboy hats and glacier views. The kilometers come back and they brought friends.",
    talk:["A rancher: \"The Alaska Highway's all paved now. Your grandparents had it worse.\"",
          "A hockey fan: \"You're gonna want the good tires. And the good snacks. It gets empty up there.\""] },
  { km:23300, name:"Whitehorse, Yukon, Canada", region:"boreal",
    desc:"The last real city for a very long time. The northern lights audition overhead.",
    talk:["A bush pilot: \"Top off fuel at every single station from here on. No exceptions.\"",
          "A musher: \"Moose on the road at dusk. A moose always wins. Always.\""] },
  { km:24700, name:"Fairbanks, Alaska, USA", region:"boreal",
    desc:"Golden Heart City. One road left: the Dalton Highway, 800 km of gravel and glory.",
    talk:["A trucker: \"The Dalton is a work road. Trucks have right of way. So do potholes.\"",
          "A local: \"Prudhoe Bay is close now. Well. 'Close.'\""] },
  { km:25300, name:"Prudhoe Bay, Alaska", region:"tundra", end:true,
    desc:"The Arctic Ocean. The end of the road. There is nowhere further to drive.",
    talk:[] }
];

const VEHICLES = [
  { id:"ev",   name:"\"Sparky\" — Electric Crossover", cost:10500,
    ops:12, speed:1.0, cargo:140, rel:0.95,
    blurb:"Dirt cheap to run and nearly unbreakable — until the software sulks. Chargers get weird in the empty places." },
  { id:"van",  name:"\"La Tortuga\" — Diesel Camper Van", cost:9000,
    ops:32, speed:1.0, cargo:250, rel:0.85,
    blurb:"The classic. Thirsty but dependable, big cargo, sleeps five if nobody breathes too deeply." },
  { id:"moto", name:"\"Colibrí\" — Adventure Motorcycle Convoy", cost:5000,
    ops:18, speed:1.25, cargo:70, rel:0.8,
    blurb:"Fast, nimble, sips fuel. Carries almost nothing and the rain finds everyone." },
  { id:"bus",  name:"\"El Jefe\" — 1978 School Bus Conversion", cost:5500,
    ops:15, speed:0.8, cargo:500, rel:0.62, comfy:true,
    blurb:"Cheap to run, comfy as a living room (+health), and absolutely full of gremlins. You will learn their names." }
];

const OCCUPATIONS = [
  { id:"nomad",    name:"Trust-Fund Nomad",          cash:20000, mult:1,
    blurb:"Money is no object. Glory, however, is scored accordingly." },
  { id:"dev",      name:"Remote Software Developer", cash:12000, mult:2,
    blurb:"Freelance gigs anywhere with wifi. Speaks fluent EV — Sparky's gremlins are just bugs." },
  { id:"vlogger",  name:"Travel Vlogger",            cash:8000,  mult:2.5,
    blurb:"Sometimes goes viral. Quirky rigs (the bus, the motos) are content gold — gigs pay more." },
  { id:"mechanic", name:"Retired Mechanic",          cash:7000,  mult:3,
    blurb:"Keeps anything alive: cheaper running costs, half the breakdowns. Old iron like El Jefe holds no secrets." }
];

// side gigs: spend a day, earn money (occupation-flavored)
const GIGS = {
  nomad:    { name:"sell vintage band tees out of the rig",          low:50,  high:180 },
  dev:      { name:"squash a stranger's bugs over cafe wifi",        low:200, high:500 },
  vlogger:  { name:"shoot a sponsored segment for a gear brand",     low:100, high:600 },
  mechanic: { name:"wrench on local vehicles in a borrowed bay",     low:150, high:400 }
};

const GEAR = [
  { id:"filter",   name:"Water Filter",        cost:150, blurb:"Halves your odds of dysentery and stomach bugs." },
  { id:"bugspray", name:"Bug Spray & Nets",    cost:100, blurb:"Halves your odds of dengue fever." },
  { id:"satphone", name:"Satellite Phone",     cost:400, blurb:"Summons help fast when the rig dies somewhere lonely — halves breakdown delays." },
  { id:"rack",     name:"Roof Rack",           cost:250, blurb:"+80 kg cargo capacity." }
];

const DISEASES = [
  { id:"dysentery", name:"dysentery",          dmg:4, days:6,
    catch:" has dysentery. That roadside ceviche was a gamble, and the house won.",
    regions:["jungle","centralam","mexico","andes","coast"], weight:5, gear:"filter" },
  { id:"dengue",    name:"dengue fever",        dmg:5, days:7,
    catch:" has dengue fever. The mosquitoes were organized.",
    regions:["jungle","centralam","coast"], weight:3, gear:"bugspray" },
  { id:"noro",      name:"norovirus",           dmg:3, days:4,
    catch:" caught norovirus. The hostel bathroom situation has become political.",
    regions:null, weight:3, contagious:true },
  { id:"altitude",  name:"altitude sickness",   dmg:3, days:3,
    catch:" has altitude sickness. The Andes do not care about your cardio.",
    regions:["andes","rockies"], weight:5 },
  { id:"heat",      name:"heat exhaustion",     dmg:3, days:3,
    catch:" has heat exhaustion. The desert charges rent.",
    regions:["atacama","mexdesert"], weight:4 },
  { id:"hypo",      name:"hypothermia",         dmg:5, days:4,
    catch:" has hypothermia. 'It's a dry cold' was a lie.",
    regions:["patagonia","tundra","boreal"], weight:4 },
  { id:"snake",     name:"a fer-de-lance bite", dmg:8, days:5,
    catch:" was bitten by a fer-de-lance. It did not warn. It never warns.",
    regions:["jungle","centralam"], weight:1 }
];

const CREW_NAME_POOL = [
  "Alex","Sam","Maya","Diego","June","Marisol","Theo","Priya","Nico","Wren",
  "Rosa","Felix","Ida","Mateo","Skye","Camila","Otis","Lena","Ravi","Paz"
];

const PACES = [
  { id:"relaxed",  name:"Relaxed",  km:280, hp:0.5,  blurb:"280 km/day. Scenic stops. Souls intact." },
  { id:"steady",   name:"Steady",   km:400, hp:0,    blurb:"400 km/day. The professional overlander cadence." },
  { id:"grueling", name:"Grueling", km:550, hp:-1.5, blurb:"550 km/day. Gas station food. Thousand-yard stares." }
];

const RATIONS = [
  { id:"filling", name:"Filling", kg:2.0, hp:1,    blurb:"2.0 kg/person/day. Street food tours. Seconds." },
  { id:"normal",  name:"Normal",  kg:1.3, hp:0,    blurb:"1.3 kg/person/day. Sensible." },
  { id:"bare",    name:"Bare",    kg:0.7, hp:-2,   blurb:"0.7 kg/person/day. Crackers and resentment." }
];

const RATINGS = [
  { min:0,    name:"Gap-Year Casualty" },
  { min:800,  name:"Roadside Regular" },
  { min:2000, name:"Seasoned Overlander" },
  { min:4000, name:"Pan-American Legend" },
  { min:7000, name:"Spirit of the Highway" }
];
