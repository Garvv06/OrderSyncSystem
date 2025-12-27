import { Item } from '../types';

export const defaultItems: Omit<Item, 'id'>[] = [
  // Nuts
  { name: 'SS Nut', category: 'Nuts', sizes: [
    { size: 'M6', stock: 1000 },
    { size: 'M8', stock: 900 },
    { size: 'M10', stock: 800 },
  ]},
  { name: 'Hex Weld Nut', category: 'Nuts', sizes: [
    { size: 'M6', stock: 700 },
    { size: 'M8', stock: 800 },
    { size: 'M10', stock: 600 },
  ]},
  { name: 'Long Nut', category: 'Nuts', sizes: [
    { size: 'M8', stock: 500 },
    { size: 'M10', stock: 500 },
    { size: 'M12', stock: 400 },
  ]},
  { name: 'Nylock Nuts', category: 'Nuts', sizes: [
    { size: 'M6', stock: 550 },
    { size: 'M8', stock: 600 },
    { size: 'M10', stock: 500 },
  ]},
  { name: 'Lock Nuts', category: 'Nuts', sizes: [
    { size: 'M8', stock: 450 },
    { size: 'M10', stock: 400 },
    { size: 'M12', stock: 350 },
  ]},
  { name: 'Black Nut', category: 'Nuts', sizes: [
    { size: 'M6', stock: 700 },
    { size: 'M8', stock: 650 },
  ]},
  { name: 'D.F. Nuts', category: 'Nuts', sizes: [
    { size: 'M8', stock: 500 },
    { size: 'M10', stock: 450 },
  ]},
  { name: 'Golden Nuts', category: 'Nuts', sizes: [
    { size: 'M8', stock: 350 },
    { size: 'M10', stock: 300 },
  ]},
  { name: 'Flange Nut', category: 'Nuts', sizes: [
    { size: 'M10', stock: 400 },
    { size: 'M12', stock: 400 },
    { size: 'M16', stock: 300 },
  ]},
  { name: 'Square Nut', category: 'Nuts', sizes: [
    { size: 'M6', stock: 400 },
    { size: 'M8', stock: 350 },
  ]},
  { name: 'High Tensile Nut', category: 'Nuts', sizes: [
    { size: 'M10', stock: 250 },
    { size: 'M12', stock: 200 },
    { size: 'M16', stock: 150 },
  ]},

  // Bolts
  { name: 'MS Rivet Cot Bolt', category: 'Bolts', sizes: [
    { size: '6mm x 20mm', stock: 550 },
    { size: '6mm x 30mm', stock: 500 },
    { size: '8mm x 25mm', stock: 450 },
  ]},
  { name: 'Foundation Bolts', category: 'Bolts', sizes: [
    { size: '10mm x 100mm', stock: 250 },
    { size: '12mm x 150mm', stock: 200 },
    { size: '16mm x 200mm', stock: 150 },
  ]},
  { name: 'Hex Bolt', category: 'Bolts', sizes: [
    { size: 'M8 x 20mm', stock: 700 },
    { size: 'M10 x 30mm', stock: 600 },
    { size: 'M12 x 40mm', stock: 500 },
  ]},
  { name: 'High Tensile Bolt', category: 'Bolts', sizes: [
    { size: 'M10 x 40mm', stock: 450 },
    { size: 'M12 x 50mm', stock: 400 },
    { size: 'M16 x 60mm', stock: 300 },
  ]},
  { name: 'Flange Bolt', category: 'Bolts', sizes: [
    { size: 'M8 x 25mm', stock: 400 },
    { size: 'M10 x 35mm', stock: 350 },
  ]},
  { name: 'SS Bolt', category: 'Bolts', sizes: [
    { size: 'M6 x 20mm', stock: 500 },
    { size: 'M8 x 30mm', stock: 450 },
    { size: 'M10 x 40mm', stock: 400 },
  ]},
  { name: 'J Bolt', category: 'Bolts', sizes: [
    { size: '8mm x 100mm', stock: 350 },
    { size: '10mm x 150mm', stock: 300 },
  ]},
  { name: 'Pipe Bolt', category: 'Bolts', sizes: [
    { size: '6mm x 30mm', stock: 450 },
    { size: '8mm x 40mm', stock: 400 },
  ]},
  { name: 'U Bolt', category: 'Bolts', sizes: [
    { size: '10mm x 100mm', stock: 300 },
    { size: '12mm x 120mm', stock: 250 },
  ]},

  // Fasteners
  { name: 'SS Thread Rod', category: 'Fasteners', sizes: [
    { size: '6mm x 1m', stock: 120 },
    { size: '8mm x 1m', stock: 100 },
    { size: '10mm x 1m', stock: 80 },
  ]},
  { name: 'Drop in Anchor', category: 'Fasteners', sizes: [
    { size: '8mm', stock: 350 },
    { size: '10mm', stock: 300 },
    { size: '12mm', stock: 250 },
  ]},
  { name: 'Double End Stud', category: 'Fasteners', sizes: [
    { size: 'M8 x 50mm', stock: 400 },
    { size: 'M10 x 60mm', stock: 350 },
  ]},
  { name: 'J Clamp', category: 'Fasteners', sizes: [
    { size: '25mm', stock: 500 },
    { size: '32mm', stock: 450 },
  ]},
  { name: 'Anchor Bolt', category: 'Fasteners', sizes: [
    { size: 'M10 x 100mm', stock: 300 },
    { size: 'M12 x 120mm', stock: 250 },
  ]},
  { name: 'Eye Bolt', category: 'Fasteners', sizes: [
    { size: 'M8', stock: 400 },
    { size: 'M10', stock: 350 },
  ]},

  // Screws
  { name: 'Self Drilling Screw', category: 'Screws', sizes: [
    { size: '4.8 x 19mm', stock: 2000 },
    { size: '4.8 x 25mm', stock: 1800 },
    { size: '5.5 x 32mm', stock: 1500 },
  ]},
  { name: 'Self Tapping Screw', category: 'Screws', sizes: [
    { size: '3.5 x 16mm', stock: 2500 },
    { size: '4.2 x 19mm', stock: 2200 },
  ]},
  { name: 'Wood Screw', category: 'Screws', sizes: [
    { size: '6 x 25mm', stock: 1800 },
    { size: '8 x 38mm', stock: 1500 },
  ]},
  { name: 'Drywall Screw', category: 'Screws', sizes: [
    { size: '3.5 x 25mm', stock: 2000 },
    { size: '3.5 x 35mm', stock: 1800 },
  ]},
  { name: 'Machine Screw', category: 'Screws', sizes: [
    { size: 'M4 x 12mm', stock: 1500 },
    { size: 'M5 x 16mm', stock: 1300 },
  ]},
  { name: 'Pan Head Screw', category: 'Screws', sizes: [
    { size: 'M4 x 10mm', stock: 1600 },
    { size: 'M5 x 12mm', stock: 1400 },
  ]},
  { name: 'Countersunk Screw', category: 'Screws', sizes: [
    { size: 'M4 x 16mm', stock: 1400 },
    { size: 'M5 x 20mm', stock: 1200 },
  ]},

  // Scaffolding Items
  { name: 'Scaffolding Coupler', category: 'Scaffolding Items', sizes: [
    { size: '48mm', stock: 500 },
    { size: '60mm', stock: 400 },
  ]},
  { name: 'Scaffolding Clamp', category: 'Scaffolding Items', sizes: [
    { size: 'Standard', stock: 600 },
    { size: 'Heavy Duty', stock: 450 },
  ]},
  { name: 'Base Jack', category: 'Scaffolding Items', sizes: [
    { size: '600mm', stock: 200 },
    { size: '800mm', stock: 150 },
  ]},
  { name: 'U Head Jack', category: 'Scaffolding Items', sizes: [
    { size: 'Standard', stock: 150 },
  ]},
  { name: 'Board Bracket', category: 'Scaffolding Items', sizes: [
    { size: '300mm', stock: 250 },
    { size: '450mm', stock: 200 },
  ]},
  { name: 'Tube', category: 'Scaffolding Items', sizes: [
    { size: '1.8m', stock: 300 },
    { size: '2.4m', stock: 250 },
    { size: '3.0m', stock: 200 },
  ]},
  { name: 'Ledger Blade', category: 'Scaffolding Items', sizes: [
    { size: '1.2m', stock: 200 },
    { size: '1.5m', stock: 180 },
  ]},

  // Washers
  { name: 'Plain Washer', category: 'Washers', sizes: [
    { size: 'M6', stock: 5000 },
    { size: 'M8', stock: 4500 },
    { size: 'M10', stock: 4000 },
    { size: 'M12', stock: 3500 },
  ]},
  { name: 'Spring Washer', category: 'Washers', sizes: [
    { size: 'M6', stock: 4000 },
    { size: 'M8', stock: 3800 },
    { size: 'M10', stock: 3500 },
  ]},
  { name: 'Flat Washer', category: 'Washers', sizes: [
    { size: 'M8', stock: 4200 },
    { size: 'M10', stock: 4000 },
  ]},
  { name: 'Tooth Lock Washer', category: 'Washers', sizes: [
    { size: 'M6', stock: 3500 },
    { size: 'M8', stock: 3200 },
  ]},
  { name: 'Fender Washer', category: 'Washers', sizes: [
    { size: '1/4"', stock: 2500 },
    { size: '3/8"', stock: 2200 },
  ]},

  // Hand Tools
  { name: 'Pipe Wrench', category: 'Hand Tools', sizes: [
    { size: '10"', stock: 50 },
    { size: '14"', stock: 40 },
    { size: '18"', stock: 30 },
  ]},
  { name: 'Spanner Set', category: 'Hand Tools', sizes: [
    { size: '6pcs', stock: 60 },
    { size: '12pcs', stock: 50 },
  ]},
  { name: 'Hammer', category: 'Hand Tools', sizes: [
    { size: '500g', stock: 80 },
    { size: '1kg', stock: 60 },
  ]},
  { name: 'Screwdriver Set', category: 'Hand Tools', sizes: [
    { size: '6pcs', stock: 70 },
    { size: '12pcs', stock: 50 },
  ]},
  { name: 'Pliers', category: 'Hand Tools', sizes: [
    { size: '6"', stock: 100 },
    { size: '8"', stock: 80 },
  ]},
  { name: 'Allen Key Set', category: 'Hand Tools', sizes: [
    { size: '9pcs', stock: 60 },
  ]},
  { name: 'Measuring Tape', category: 'Hand Tools', sizes: [
    { size: '3m', stock: 100 },
    { size: '5m', stock: 80 },
  ]},
  { name: 'Spirit Level', category: 'Hand Tools', sizes: [
    { size: '2ft', stock: 50 },
    { size: '3ft', stock: 40 },
  ]},
  { name: 'Wire Cutter', category: 'Hand Tools', sizes: [
    { size: '6"', stock: 80 },
    { size: '8"', stock: 60 },
  ]},
];