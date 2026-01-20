import { Item } from '../types';

export const defaultItems: Omit<Item, 'id'>[] = [
  // Nuts
  { name: 'SS Nut', category: 'Nut', sizes: [
    { size: 'M6', stock: 500 },
    { size: 'M8', stock: 750 },
    { size: 'M10', stock: 600 },
  ]},
  { name: 'Hex weld Nut', category: 'Nut', sizes: [
    { size: 'M6', stock: 400 },
    { size: 'M8', stock: 550 },
    { size: 'M10', stock: 450 },
  ]},
  { name: 'Long Nut', category: 'Nut', sizes: [
    { size: 'M8', stock: 300 },
    { size: 'M10', stock: 400 },
    { size: 'M12', stock: 350 },
  ]},
  { name: 'Nylock Nuts', category: 'Nut', sizes: [
    { size: 'M6', stock: 600 },
    { size: 'M8', stock: 700 },
    { size: 'M10', stock: 500 },
  ]},
  { name: 'Lock Nuts', category: 'Nut', sizes: [
    { size: 'M8', stock: 450 },
    { size: 'M10', stock: 500 },
    { size: 'M12', stock: 400 },
  ]},
  { name: 'Black Nut', category: 'Nut', sizes: [
    { size: 'M6', stock: 550 },
    { size: 'M8', stock: 650 },
    { size: 'M10', stock: 600 },
  ]},
  { name: 'D.F. Nuts', category: 'Nut', sizes: [
    { size: 'M8', stock: 350 },
    { size: 'M10', stock: 450 },
    { size: 'M12', stock: 400 },
  ]},
  { name: 'Golden Nuts', category: 'Nut', sizes: [
    { size: 'M8', stock: 300 },
    { size: 'M10', stock: 350 },
    { size: 'M12', stock: 300 },
  ]},
  { name: 'Flange Nut', category: 'Nut', sizes: [
    { size: 'M10', stock: 400 },
    { size: 'M12', stock: 450 },
    { size: 'M16', stock: 350 },
  ]},
  { name: 'Square Nut', category: 'Nut', sizes: [
    { size: 'M6', stock: 300 },
    { size: 'M8', stock: 400 },
    { size: 'M10', stock: 350 },
  ]},
  { name: 'High Tensile Nut', category: 'Nut', sizes: [
    { size: 'M10', stock: 250 },
    { size: 'M12', stock: 300 },
    { size: 'M16', stock: 200 },
  ]},

  // Bolts
  { name: 'Ms Rivet', category: 'Bolts', sizes: [
    { size: '6mm', stock: 800 },
    { size: '8mm', stock: 900 },
    { size: '10mm', stock: 700 },
  ]},
  { name: 'Cot Bolt', category: 'Bolts', sizes: [
    { size: '6mm x 20mm', stock: 500 },
    { size: '8mm x 25mm', stock: 600 },
    { size: '10mm x 30mm', stock: 550 },
  ]},
  { name: 'Foundation Bolts', category: 'Bolts', sizes: [
    { size: '10mm x 100mm', stock: 300 },
    { size: '12mm x 150mm', stock: 350 },
    { size: '16mm x 200mm', stock: 250 },
  ]},
  { name: 'Hex Bolt', category: 'Bolts', sizes: [
    { size: 'M8 x 20mm', stock: 700 },
    { size: 'M10 x 30mm', stock: 800 },
    { size: 'M12 x 40mm', stock: 600 },
  ]},
  { name: 'High tensile Bolt', category: 'Bolts', sizes: [
    { size: 'M10 x 40mm', stock: 400 },
    { size: 'M12 x 50mm', stock: 450 },
    { size: 'M16 x 60mm', stock: 350 },
  ]},
  { name: 'Flange Bolt', category: 'Bolts', sizes: [
    { size: 'M8 x 25mm', stock: 500 },
    { size: 'M10 x 35mm', stock: 550 },
    { size: 'M12 x 45mm', stock: 450 },
  ]},
  { name: 'SS Bolt', category: 'Bolts', sizes: [
    { size: 'M6 x 20mm', stock: 600 },
    { size: 'M8 x 30mm', stock: 700 },
    { size: 'M10 x 40mm', stock: 550 },
  ]},
  { name: 'J Bolt', category: 'Bolts', sizes: [
    { size: '8mm x 100mm', stock: 250 },
    { size: '10mm x 150mm', stock: 300 },
    { size: '12mm x 200mm', stock: 200 },
  ]},
  { name: 'Pipe Bolt', category: 'Bolts', sizes: [
    { size: '6mm x 30mm', stock: 400 },
    { size: '8mm x 40mm', stock: 450 },
    { size: '10mm x 50mm', stock: 400 },
  ]},
  { name: 'U Bolt', category: 'Bolts', sizes: [
    { size: '10mm x 100mm', stock: 300 },
    { size: '12mm x 120mm', stock: 350 },
    { size: '16mm x 150mm', stock: 250 },
  ]},

  // Fasteners
  { name: 'SS Thread Rod', category: 'Fasteners', sizes: [
    { size: '6mm x 1m', stock: 200 },
    { size: '8mm x 1m', stock: 250 },
    { size: '10mm x 1m', stock: 200 },
  ]},
  { name: 'Drop in Anchor', category: 'Fasteners', sizes: [
    { size: '8mm', stock: 350 },
    { size: '10mm', stock: 400 },
    { size: '12mm', stock: 300 },
  ]},
  { name: 'Anchor Bolt', category: 'Fasteners', sizes: [
    { size: 'M10 x 100mm', stock: 300 },
    { size: 'M12 x 120mm', stock: 350 },
    { size: 'M16 x 150mm', stock: 250 },
  ]},
  { name: 'SS Anchor Bolt', category: 'Fasteners', sizes: [
    { size: 'M8 x 80mm', stock: 250 },
    { size: 'M10 x 100mm', stock: 300 },
    { size: 'M12 x 120mm', stock: 250 },
  ]},
  { name: 'Anchor Hook', category: 'Fasteners', sizes: [
    { size: '8mm', stock: 300 },
    { size: '10mm', stock: 350 },
    { size: '12mm', stock: 300 },
  ]},
  { name: 'Wedge Anchor', category: 'Fasteners', sizes: [
    { size: 'M8 x 75mm', stock: 400 },
    { size: 'M10 x 100mm', stock: 450 },
    { size: 'M12 x 120mm', stock: 350 },
  ]},
  { name: 'Sleeve Bolt', category: 'Fasteners', sizes: [
    { size: 'M8', stock: 350 },
    { size: 'M10', stock: 400 },
    { size: 'M12', stock: 300 },
  ]},
  { name: 'Sleeve Nut', category: 'Fasteners', sizes: [
    { size: 'M8', stock: 350 },
    { size: 'M10', stock: 400 },
    { size: 'M12', stock: 300 },
  ]},
  { name: 'Sleeve Hook', category: 'Fasteners', sizes: [
    { size: '8mm', stock: 300 },
    { size: '10mm', stock: 350 },
    { size: '12mm', stock: 300 },
  ]},
  { name: 'D Hook', category: 'Fasteners', sizes: [
    { size: '8mm', stock: 300 },
    { size: '10mm', stock: 350 },
    { size: '12mm', stock: 300 },
  ]},
  { name: 'Sprinkle Clamp', category: 'Fasteners', sizes: [
    { size: '25mm', stock: 200 },
    { size: '32mm', stock: 250 },
    { size: '40mm', stock: 200 },
  ]},
  { name: 'Rubber Clamp', category: 'Fasteners', sizes: [
    { size: '20mm', stock: 250 },
    { size: '25mm', stock: 300 },
    { size: '32mm', stock: 250 },
  ]},
  { name: 'Thread Rod', category: 'Fasteners', sizes: [
    { size: 'M8 x 1m', stock: 200 },
    { size: 'M10 x 1m', stock: 250 },
    { size: 'M12 x 1m', stock: 200 },
  ]},
  { name: 'Slotted Channels', category: 'Fasteners', sizes: [
    { size: '41x41', stock: 150 },
    { size: '41x21', stock: 150 },
  ]},
  { name: 'Wedge Clump', category: 'Fasteners', sizes: [
    { size: 'Standard', stock: 200 },
  ]},
  { name: 'Beam Clump', category: 'Fasteners', sizes: [
    { size: 'Standard', stock: 200 },
  ]},
  { name: 'Coupling Nut', category: 'Fasteners', sizes: [
    { size: 'M8', stock: 300 },
    { size: 'M10', stock: 350 },
    { size: 'M12', stock: 300 },
  ]},
  { name: 'Pin Type Anchor', category: 'Fasteners', sizes: [
    { size: '8mm', stock: 250 },
    { size: '10mm', stock: 300 },
    { size: '12mm', stock: 250 },
  ]},

  // Screws
  { name: 'SS Sheetmetal Screws', category: 'Screw', sizes: [
    { size: '4.8 x 19mm', stock: 800 },
    { size: '4.8 x 25mm', stock: 900 },
    { size: '5.5 x 32mm', stock: 700 },
  ]},
  { name: 'SS Carriage Bolts', category: 'Screw', sizes: [
    { size: 'M6 x 25mm', stock: 500 },
    { size: 'M8 x 30mm', stock: 600 },
    { size: 'M10 x 40mm', stock: 500 },
  ]},
  { name: 'SS Wood Screws', category: 'Screw', sizes: [
    { size: '6 x 25mm', stock: 700 },
    { size: '8 x 38mm', stock: 800 },
    { size: '10 x 50mm', stock: 600 },
  ]},
  { name: 'Sds Screw :Csk,Thrusst,Hex', category: 'Screw', sizes: [
    { size: 'CSK 4.8x19', stock: 600 },
    { size: 'Thrust 4.8x19', stock: 600 },
    { size: 'Hex 4.8x19', stock: 600 },
  ]},
  { name: 'Drywall Screw', category: 'Screw', sizes: [
    { size: '3.5 x 25mm', stock: 900 },
    { size: '3.5 x 35mm', stock: 1000 },
    { size: '3.5 x 45mm', stock: 800 },
  ]},
  { name: 'Machine Screws', category: 'Screw', sizes: [
    { size: 'M4 x 12mm', stock: 700 },
    { size: 'M5 x 16mm', stock: 800 },
    { size: 'M6 x 20mm', stock: 700 },
  ]},
  { name: 'Coach Screw', category: 'Screw', sizes: [
    { size: '8 x 50mm', stock: 400 },
    { size: '10 x 60mm', stock: 450 },
    { size: '12 x 80mm', stock: 350 },
  ]},
  { name: 'Carriage Bolt', category: 'Screw', sizes: [
    { size: 'M8 x 30mm', stock: 500 },
    { size: 'M10 x 40mm', stock: 550 },
    { size: 'M12 x 50mm', stock: 450 },
  ]},
  { name: 'Roofing Bolt', category: 'Screw', sizes: [
    { size: '6mm', stock: 600 },
    { size: '8mm', stock: 700 },
  ]},
  { name: 'Sheetmetal Screw Tempered', category: 'Screw', sizes: [
    { size: '4.8 x 19mm', stock: 750 },
    { size: '4.8 x 25mm', stock: 850 },
    { size: '5.5 x 32mm', stock: 650 },
  ]},
  { name: 'SS Machine Scew', category: 'Screw', sizes: [
    { size: 'M4 x 12mm', stock: 650 },
    { size: 'M5 x 16mm', stock: 750 },
    { size: 'M6 x 20mm', stock: 650 },
  ]},
  { name: 'B Hook', category: 'Screw', sizes: [
    { size: 'Small', stock: 400 },
    { size: 'Medium', stock: 500 },
    { size: 'Large', stock: 350 },
  ]},
  { name: 'M Hook', category: 'Screw', sizes: [
    { size: 'Small', stock: 400 },
    { size: 'Medium', stock: 500 },
    { size: 'Large', stock: 350 },
  ]},
  { name: 'Cup Hook', category: 'Screw', sizes: [
    { size: 'Small', stock: 450 },
    { size: 'Medium', stock: 550 },
    { size: 'Large', stock: 400 },
  ]},
  { name: 'Door Safety', category: 'Screw', sizes: [
    { size: 'Standard', stock: 300 },
  ]},

  // Scaffolding Items
  { name: 'Scaffolding Pin', category: 'Scapfolding Items', sizes: [
    { size: 'Standard', stock: 500 },
  ]},
  { name: 'Forged Coupler(Swl/Fixed', category: 'Scapfolding Items', sizes: [
    { size: 'SWL', stock: 300 },
    { size: 'Fixed', stock: 300 },
  ]},
  { name: 'Golden Coupler(Swl/Fixed', category: 'Scapfolding Items', sizes: [
    { size: 'SWL', stock: 250 },
    { size: 'Fixed', stock: 250 },
  ]},
  { name: 'T-Bolt', category: 'Scapfolding Items', sizes: [
    { size: 'M16', stock: 350 },
    { size: 'M20', stock: 300 },
  ]},
  { name: 'Tie Rod', category: 'Scapfolding Items', sizes: [
    { size: '12mm', stock: 200 },
    { size: '16mm', stock: 250 },
  ]},
  { name: 'Prop Sleeve with Nut', category: 'Scapfolding Items', sizes: [
    { size: 'Standard', stock: 300 },
  ]},
  { name: 'Anchor Nut', category: 'Scapfolding Items', sizes: [
    { size: 'M12', stock: 400 },
    { size: 'M16', stock: 350 },
  ]},
  { name: 'Wing Nut', category: 'Scapfolding Items', sizes: [
    { size: 'M8', stock: 500 },
    { size: 'M10', stock: 550 },
    { size: 'M12', stock: 450 },
  ]},
  { name: 'Beam Clump', category: 'Scapfolding Items', sizes: [
    { size: 'Standard', stock: 200 },
  ]},
  { name: 'I Bolt', category: 'Scapfolding Items', sizes: [
    { size: 'M12', stock: 300 },
    { size: 'M16', stock: 250 },
  ]},
  { name: 'Water Stopper', category: 'Scapfolding Items', sizes: [
    { size: '20mm', stock: 250 },
    { size: '25mm', stock: 300 },
  ]},
  { name: 'Ledger Plate', category: 'Scapfolding Items', sizes: [
    { size: 'Standard', stock: 200 },
  ]},
  { name: 'Top Plate', category: 'Scapfolding Items', sizes: [
    { size: 'Standard', stock: 200 },
  ]},
  { name: 'Bottom Cap', category: 'Scapfolding Items', sizes: [
    { size: 'Standard', stock: 250 },
  ]},

  // Washers
  { name: 'Spring Washer', category: 'Washer', sizes: [
    { size: 'M6', stock: 1000 },
    { size: 'M8', stock: 1200 },
    { size: 'M10', stock: 1000 },
    { size: 'M12', stock: 900 },
  ]},
  { name: 'EN 8 Washer', category: 'Washer', sizes: [
    { size: 'M8', stock: 800 },
    { size: 'M10', stock: 900 },
    { size: 'M12', stock: 700 },
  ]},
  { name: 'Golden Washer', category: 'Washer', sizes: [
    { size: 'M8', stock: 600 },
    { size: 'M10', stock: 700 },
    { size: 'M12', stock: 600 },
  ]},

  // Hand Tools
  { name: 'Claw Hammer', category: 'Hand Tools', sizes: [
    { size: '500g', stock: 50 },
    { size: '1kg', stock: 60 },
  ]},
  { name: 'Sledge Hammer', category: 'Hand Tools', sizes: [
    { size: '2kg', stock: 40 },
    { size: '3kg', stock: 45 },
    { size: '5kg', stock: 35 },
  ]},
  { name: 'Hexaframe', category: 'Hand Tools', sizes: [
    { size: 'Standard', stock: 80 },
  ]},
  { name: 'Spanner', category: 'Hand Tools', sizes: [
    { size: '6-8mm', stock: 100 },
    { size: '10-12mm', stock: 120 },
    { size: '14-17mm', stock: 90 },
  ]},
  { name: 'Plumbob', category: 'Hand Tools', sizes: [
    { size: 'Standard', stock: 70 },
  ]},
  { name: 'G Clamp', category: 'Hand Tools', sizes: [
    { size: '2 inch', stock: 60 },
    { size: '4 inch', stock: 70 },
    { size: '6 inch', stock: 50 },
  ]},
  { name: 'Plier', category: 'Hand Tools', sizes: [
    { size: '6 inch', stock: 80 },
    { size: '8 inch', stock: 90 },
  ]},
];