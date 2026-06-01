interface Props {
  onClick: () => void;
  disabled?: boolean;
}

export default function StopButton({ onClick, disabled }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-64 h-64 rounded-full font-bold text-4xl tracking-widest
        transition-all duration-75 active:scale-95
        ${disabled
          ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
          : 'bg-red-600 hover:bg-red-500 text-white shadow-2xl shadow-red-600/40 hover:shadow-red-500/50 cursor-pointer'
        }
      `}
    >
      STOP
    </button>
  );
}
