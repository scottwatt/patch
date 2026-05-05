export type Trade = {
  slug: string;
  name: string;
  icon: string;
  tagline: string;
  description: string;
  commonProblems: string[];
  examplePrompts: string[];
};

export const trades: Trade[] = [
  {
    slug: 'plumbing',
    name: 'Plumbing',
    icon: 'P',
    tagline: 'Leaks, clogs, water heaters, and pipe repair',
    description:
      'Local Bakersfield plumbers vetted for licensing, insurance, and follow through. Same day calls for emergencies.',
    commonProblems: [
      'Leaking pipes or faucets',
      'Clogged drains or toilets',
      'Water heater not heating, leaking, or making noise',
      'Low water pressure',
      'Sewer line backups',
      'Garbage disposal failure',
      'Slab leaks or water bill spikes',
    ],
    examplePrompts: [
      'My water heater is leaking from the bottom',
      'Toilet won’t stop running',
      'Brown spot growing on the ceiling under my upstairs bathroom',
    ],
  },
  {
    slug: 'hvac',
    name: 'HVAC',
    icon: 'H',
    tagline: 'AC, heating, ductwork, and air quality',
    description:
      'Heating and cooling pros who know Bakersfield summers. Tuneups, repairs, and full system replacements.',
    commonProblems: [
      'AC not cooling or blowing warm air',
      'Heater not turning on',
      'High electric bill from inefficient system',
      'Strange smells or sounds from vents',
      'Uneven temperatures between rooms',
      'Frozen outdoor unit',
      'Thermostat not responding',
    ],
    examplePrompts: [
      'My AC is running but the house is still hot',
      'Furnace blows cold air',
      'There’s a burning smell when the heater kicks on',
    ],
  },
  {
    slug: 'electrical',
    name: 'Electrical',
    icon: 'E',
    tagline: 'Wiring, panels, outlets, and lighting',
    description:
      'Licensed electricians for repairs, panel upgrades, EV chargers, and code safe rewiring.',
    commonProblems: [
      'Outlets or switches not working',
      'Breaker trips repeatedly',
      'Flickering or dimming lights',
      'Need to install ceiling fan, light fixture, or EV charger',
      'Panel upgrade or subpanel install',
      'Burning smell from outlet',
      'Power out in part of the house',
    ],
    examplePrompts: [
      'Half the outlets in my kitchen stopped working',
      'I want to install a Tesla charger in my garage',
      'My breaker keeps tripping when I run the microwave',
    ],
  },
  {
    slug: 'roofing',
    name: 'Roofing',
    icon: 'R',
    tagline: 'Repairs, replacements, leaks, and inspections',
    description:
      'Trusted Kern County roofers for storm damage, leak repair, and full roof replacement. Free inspections.',
    commonProblems: [
      'Active leak during rain',
      'Missing or damaged shingles after wind',
      'Sagging or soft spots on roof',
      'Roof age 20+ years, planning replacement',
      'Insurance claim after storm damage',
      'Gutters or flashing failure',
    ],
    examplePrompts: [
      'I see daylight in my attic',
      'My roof is leaking after the last storm',
      'How much for a tile roof replacement on a 1,800 sqft house?',
    ],
  },
  {
    slug: 'handyman',
    name: 'Handyman',
    icon: 'H',
    tagline: 'Small repairs, mounting, drywall, and odd jobs',
    description:
      'Reliable local handymen for the long honey do list. Hourly or flat rate.',
    commonProblems: [
      'Mount TV or shelving',
      'Patch and paint drywall',
      'Door won’t close or latch properly',
      'Replace ceiling fan or light fixture',
      'Cabinet repair or hinge replacement',
      'Caulking, weatherstripping, small leaks',
      'General punch list before move out or sale',
    ],
    examplePrompts: [
      'I have a list of 8 small things to fix around the house',
      'Need someone to mount a 75 inch TV',
      'Door frame is split and the door won’t latch',
    ],
  },
  {
    slug: 'garage-door',
    name: 'Garage Door',
    icon: 'G',
    tagline: 'Springs, openers, panels, and full door replacement',
    description:
      'Bakersfield garage door specialists. Spring replacement, opener repair, panel replacement, and full door installs. Same day for safety issues.',
    commonProblems: [
      'Garage door will not open or close',
      'Loud grinding or popping noise when opening',
      'Spring snapped, door is heavy or stuck',
      'Opener not responding to remote',
      'Door is off the track',
      'Damaged panel after backing into the door',
      'Sensor lights blinking, door reverses',
      'Want a new garage door installed',
    ],
    examplePrompts: [
      'My garage door spring snapped and the door is stuck closed',
      'The opener stopped responding to my remote',
      'I backed into the garage door and it is bent',
    ],
  },
  {
    slug: 'pest-control',
    name: 'Pest Control',
    icon: 'X',
    tagline: 'Termites, ants, roaches, rodents, and bees',
    description:
      'Bakersfield pest control. Termite inspection and treatment, ant and roach extermination, rodent removal, scorpion control, monthly service plans.',
    commonProblems: [
      'Ants in the kitchen or bathroom',
      'Termite damage in walls or wood',
      'Cockroaches in the house',
      'Mice or rats in the attic, walls, or garage',
      'Scorpions inside the house',
      'Spider webs everywhere',
      'Bee or wasp nest near the house',
      'Want a regular monthly pest service',
    ],
    examplePrompts: [
      'I have ants all over my kitchen counters',
      'Found termite damage in my baseboards',
      'Hearing scratching in the walls at night',
    ],
  },
  {
    slug: 'concrete',
    name: 'Concrete',
    icon: 'C',
    tagline: 'Driveways, patios, foundations, and walkways',
    description:
      'Bakersfield concrete contractors. Driveway pours, patio installs, decorative concrete, foundation repair, walkways and slabs.',
    commonProblems: [
      'New driveway pour or replacement',
      'Cracked driveway or settlement',
      'New concrete patio or pool deck',
      'Stamped or decorative concrete',
      'Cracked sidewalk or front steps',
      'Foundation crack or settlement',
      'Pour a new slab for an addition or shed',
    ],
    examplePrompts: [
      'I want to replace my cracked driveway',
      'Need a new concrete patio behind my house',
      'There is a big crack across my garage floor',
    ],
  },
  {
    slug: 'landscaping',
    name: 'Landscaping',
    icon: 'L',
    tagline: 'Lawn care, sod, irrigation, trees, and yard cleanup',
    description:
      'Bakersfield landscapers for weekly mowing, sprinkler repair, sod installs, tree trimming, drought tolerant design, and full yard makeovers.',
    commonProblems: [
      'Need weekly lawn mowing service',
      'Brown spots or dead patches in the lawn',
      'Sprinkler or drip irrigation not working',
      'Tree needs trimming or removal',
      'Yard cleanup after storm or neglected season',
      'Full yard makeover or new sod install',
      'Drought tolerant landscape design',
      'Hardscape work like pavers or rock beds',
    ],
    examplePrompts: [
      'I need someone to mow my lawn weekly',
      'My sprinklers stopped working in half the yard',
      'The trees in my front yard need trimming',
    ],
  },
  {
    slug: 'junk-removal',
    name: 'Junk Removal',
    icon: 'J',
    tagline: 'Furniture, appliances, debris, and yard waste hauling',
    description:
      'Bakersfield junk removal and hauling. Old furniture, appliances, construction debris, yard waste, garage cleanouts, and full estate cleanouts.',
    commonProblems: [
      'Old couch or furniture to haul away',
      'Broken appliance pickup (fridge, washer, dryer, water heater)',
      'Construction debris cleanup after a project',
      'Yard waste, branches, or palm fronds hauling',
      'Garage or shed cleanout',
      'Estate cleanout or move out',
      'Mattress and box spring disposal',
      'Hot tub removal',
    ],
    examplePrompts: [
      'I have an old couch I need hauled away',
      'Need to get rid of a broken refrigerator',
      'Just cleaned out my garage, need someone to haul the pile',
    ],
  },
];

export const tradeBySlug = (slug: string) => trades.find((t) => t.slug === slug);
