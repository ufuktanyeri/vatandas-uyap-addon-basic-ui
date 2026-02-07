interface FabProps {
  onClick: () => void;
}

// Module-level: pulse stops after first click, resets on page navigation
let hasBeenClicked = false;

export function resetFabPulse() {
  hasBeenClicked = false;
}

export function Fab({ onClick }: FabProps) {
  const handleClick = () => {
    hasBeenClicked = true;
    onClick();
  };

  return (
    <button
      class={`uyap-ext-fab${!hasBeenClicked ? ' uyap-ext-fab--pulse' : ''}`}
      onClick={handleClick}
      title="Evrak Indirici"
    >
      <i class="fa fa-download"></i>
    </button>
  );
}
