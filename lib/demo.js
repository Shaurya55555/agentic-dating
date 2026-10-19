import demo from "@/data/demo.json";

export const people = demo.people;
export const dates = demo.dates;
export const rankings = demo.rankings;
export const leaks = demo.leaks || {};
export const dateKey = (a, b) => [a, b].sort().join("__");
export const initials = (n) => n.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
export const hue = (n) => [...n].reduce((s, c) => s + c.charCodeAt(0), 0) % 360;
