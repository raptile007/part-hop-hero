import brakes from "@/assets/parts/brakes.jpg";
import drivetrain from "@/assets/parts/drivetrain.jpg";
import tires from "@/assets/parts/tires.jpg";
import wheels from "@/assets/parts/wheels.jpg";
import suspension from "@/assets/parts/suspension.jpg";
import electrical from "@/assets/parts/electrical.jpg";
import lubricants from "@/assets/parts/lubricants.jpg";
import accessories from "@/assets/parts/accessories.jpg";
import engineHero from "@/assets/parts/engine-hero.jpg";
import type { PartCategory } from "./types";

export const CATEGORY_IMAGES: Record<PartCategory, string> = {
  brakes,
  drivetrain,
  tires,
  wheels,
  suspension,
  electrical,
  lubricants,
  accessories,
};

export const HERO_IMAGE = engineHero;
