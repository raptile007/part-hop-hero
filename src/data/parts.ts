import type { Part } from "./types";

export const PARTS: Part[] = [
  { id: "p-brake-pad-front", name: "Front Brake Pad Set", category: "brakes", brand: "Brembo", fitsBikes: ["Royal Enfield Classic 350", "KTM Duke 390"] },
  { id: "p-brake-disc-300", name: "Brake Disc 300mm", category: "brakes", brand: "Galfer", fitsBikes: ["KTM Duke 390", "Yamaha R15"] },
  { id: "p-brake-fluid-dot4", name: "DOT 4 Brake Fluid 250ml", category: "brakes", brand: "Motul", fitsBikes: ["Universal"] },
  { id: "p-chain-525", name: "Chain 525 O-Ring", category: "drivetrain", brand: "DID", fitsBikes: ["Royal Enfield Classic 350", "Bajaj Dominar 400"] },
  { id: "p-sprocket-rear", name: "Rear Sprocket 42T", category: "drivetrain", brand: "JT", fitsBikes: ["KTM Duke 390"] },
  { id: "p-clutch-cable", name: "Clutch Cable", category: "drivetrain", brand: "OEM", fitsBikes: ["Bajaj Pulsar 150"] },
  { id: "p-tire-mrf-100", name: "MRF Zapper 100/80-17", category: "tires", brand: "MRF", fitsBikes: ["Bajaj Pulsar 150", "TVS Apache RTR 160"] },
  { id: "p-tire-mich-150", name: "Michelin Pilot Street 150/60-17", category: "tires", brand: "Michelin", fitsBikes: ["KTM Duke 390", "Yamaha R15"] },
  { id: "p-tube-17", name: "Tube 17\" Heavy Duty", category: "tires", brand: "Ralco", fitsBikes: ["Universal"] },
  { id: "p-spoke-set", name: "Spoke Set Stainless", category: "wheels", brand: "OEM", fitsBikes: ["Royal Enfield Classic 350"] },
  { id: "p-bearing-6203", name: "Wheel Bearing 6203", category: "wheels", brand: "SKF", fitsBikes: ["Universal"] },
  { id: "p-fork-oil", name: "Fork Oil 10W 1L", category: "suspension", brand: "Motul", fitsBikes: ["Universal"] },
  { id: "p-rear-shock", name: "Rear Mono-shock", category: "suspension", brand: "YSS", fitsBikes: ["Bajaj Pulsar 150", "TVS Apache RTR 160"] },
  { id: "p-spark-plug", name: "Iridium Spark Plug", category: "electrical", brand: "NGK", fitsBikes: ["Universal"] },
  { id: "p-battery-12v", name: "Battery 12V 9Ah", category: "electrical", brand: "Exide", fitsBikes: ["Royal Enfield Classic 350", "Bajaj Dominar 400"] },
  { id: "p-led-headlight", name: "LED Headlight Bulb H4", category: "electrical", brand: "Philips", fitsBikes: ["Universal"] },
  { id: "p-engine-oil-10w40", name: "Engine Oil 10W-40 1L", category: "lubricants", brand: "Motul", fitsBikes: ["Universal"] },
  { id: "p-chain-lube", name: "Chain Lube Spray 400ml", category: "lubricants", brand: "Liqui Moly", fitsBikes: ["Universal"] },
  { id: "p-mirror-set", name: "Mirror Set Bar-end", category: "accessories", brand: "Rizoma", fitsBikes: ["Universal"] },
  { id: "p-grip-set", name: "Grip Set Anti-vibration", category: "accessories", brand: "ProTaper", fitsBikes: ["Universal"] },
];
