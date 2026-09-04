"use client";

let generation = 0;

export function bumpNavigationGeneration() {
  generation += 1;
  return generation;
}

export function getNavigationGeneration() {
  return generation;
}
