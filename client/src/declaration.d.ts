declare module "*.svg" {
  import * as React from "react";
  export const ReactComponent: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement> & { title?: string } & React.RefAttributes<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module "animejs" {
  const anime: any;
  export default anime;
}
  