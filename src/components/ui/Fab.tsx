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
      <svg
        class="uyap-w-6 uyap-h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    </button>
  );
}
