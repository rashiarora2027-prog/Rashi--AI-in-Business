// Minimal replacements for the parts of vite/client this project actually uses.
// Declared locally so the build never depends on resolving Vite's own types,
// which is what broke the first Vercel deployment.

declare module '*.css';
declare module '*.scss';
declare module '*.svg' {
  const src: string;
  export default src;
}
declare module '*.png' {
  const src: string;
  export default src;
}
declare module '*.jpg' {
  const src: string;
  export default src;
}
