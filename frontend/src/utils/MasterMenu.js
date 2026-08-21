export const ATELIER_MASTER_MENU = {
  styles: ["Oxford", "Loafer", "Derby", "Monk Strap", "Chelsea Boot"],
  // lasts: [
  //   "Lagos (Chiseled)",
  //   "London (Round)",
  //   "Milan (Slim)",
  //   "Abuja (Soft Square)",
  // ],
  materials: [
    "Museum Calf",
    "Box Calf",
    "Shell Cordovan",
    "Suede",
    "Pebble Grain",
  ],
  colors: ["navy", "black", "brown"],
  constructions: ["Hand-Welted", "Goodyear Welted", "Blake Stitched"],
  widths: ["D (Standard)", "E (Wide)", "EE (Extra Wide)"],
  sizes: [38, 39, 40, 41, 42, 43, 44, 45, 46, 47],
};

export const PRICE_MODIFIERS = {
  material: {
    "Shell Cordovan": 450, // Premium leather upcharge
    "Museum Calf": 50,
    Suede: 0, // Standard options are +0
  },
  construction: {
    "Hand-Welted": 200, // High-labor upcharge
    "Goodyear Welted": 0,
  },
  soles: {
    "Double Leather": 40,
    Vibram: 25,
  },
};

//Dynamic Pricing
// const calculateTotalPrice = () => {
//   const base = Number(formData.price) || 0;
//   let totalModifications = 0;

//   // Iterate through shoeDetails to find modifiers
//   Object.keys(formData.shoeDetails).forEach((detailKey) => {
//     const selectedOptions = formData.shoeDetails[detailKey];

//     // Ensure we are looking at an array (since we updated your model)
//     if (Array.isArray(selectedOptions)) {
//       selectedOptions.forEach((option) => {
//         const upcharge = PRICE_MODIFIERS[detailKey]?.[option] || 0;
//         totalModifications += upcharge;
//       });
//     }
//   });

//   return base + totalModifications;
// };
//
//
// REACT OBJECTS

// <div className="mt-4 p-4 bg-atelier-ink/5 border border-atelier-ink/10">
//   <div className="flex justify-between text-[10px] uppercase tracking-widest">
//     <span>Base Commission</span>
//     <span>${formData.price}</span>
//   </div>

//   {/* Map through selected items that have an upcharge */}
//   {Object.entries(formData.shoeDetails).map(([key, selections]) =>
//     selections.map(selection => {
//       const cost = PRICE_MODIFIERS[key]?.[selection];
//       if (cost > 0) {
//         return (
//           <div key={selection} className="flex justify-between text-[10px] uppercase tracking-widest opacity-60">
//             <span>+ {selection} ({key})</span>
//             <span>+${cost}</span>
//           </div>
//         );
//       }
//       return null;
//     })
//   )}

//   <div className="flex justify-between border-t border-atelier-ink/20 mt-4 pt-2 font-bold italic">
//     <span>Total Estimate</span>
//     <span>${calculateTotalPrice()}</span>
//   </div>
// </div>
