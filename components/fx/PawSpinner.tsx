import { PawPrint } from './sprites';

/** Four paw prints pulsing in sequence — a busy indicator for buttons. */
export function PawSpinner({ size = 18 }: { size?: number }) {
  return (
    <span aria-hidden="true" className="fx-paw-spinner inline-flex items-center gap-[2px]">
      <PawPrint size={size} className="-rotate-12" />
      <PawPrint size={size} className="rotate-12" />
      <PawPrint size={size} className="-rotate-12" />
      <PawPrint size={size} className="rotate-12" />
    </span>
  );
}
