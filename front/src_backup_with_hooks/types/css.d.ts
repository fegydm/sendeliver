// src/types/css.d.ts
declare module "*.ui.css" {
  const classes: {
    [key: string]: string;
  };
  export default classes;
}
