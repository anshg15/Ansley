import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function IconFrame({ children, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {children}
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) { return <IconFrame {...props}><path d="M5 12h14M14 7l5 5-5 5" /></IconFrame>; }
export function CheckIcon(props: IconProps) { return <IconFrame {...props}><path d="m5 12 4 4L19 6" /></IconFrame>; }
export function ClockIcon(props: IconProps) { return <IconFrame {...props}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></IconFrame>; }
export function MapPinIcon(props: IconProps) { return <IconFrame {...props}><path d="M19 10c0 5-7 10-7 10S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2" /></IconFrame>; }
export function RouteIcon(props: IconProps) { return <IconFrame {...props}><circle cx="6" cy="18" r="2" /><circle cx="18" cy="6" r="2" /><path d="M8 18h3a3 3 0 0 0 3-3V9a3 3 0 0 1 3-3h1" /></IconFrame>; }
export function SparkIcon(props: IconProps) { return <IconFrame {...props}><path d="m12 3 1.3 4.2L17.5 8.5l-4.2 1.3L12 14l-1.3-4.2-4.2-1.3 4.2-1.3L12 3ZM18.5 14l.7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3Z" /></IconFrame>; }
