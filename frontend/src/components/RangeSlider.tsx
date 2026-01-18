'use client';

interface RangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  onMouseUp?: () => void;
  step?: number;
}

export default function RangeSlider({
  min,
  max,
  value,
  onChange,
  onMouseUp,
  step = 1,
}: RangeSliderProps) {
  const minPosition = ((value[0] - min) / (max - min)) * 100;
  const maxPosition = ((value[1] - min) / (max - min)) * 100;

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.min(Number(e.target.value), value[1]);
    onChange([newMin, value[1]]);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.max(Number(e.target.value), value[0]);
    onChange([value[0], newMax]);
  };

  const handleMouseUp = () => {
    if (onMouseUp) {
      onMouseUp();
    }
  };

  return (
    <div className="relative py-4">
      {/* Track Background */}
      <div className="h-2 bg-gray-200 rounded-full relative">
        {/* Active Range */}
        <div
          className="absolute h-2 bg-sky-600 rounded-full"
          style={{
            left: `${minPosition}%`,
            width: `${maxPosition - minPosition}%`,
          }}
        />
      </div>

      {/* Min Range Input */}
      <input
        type="range"
        min={min}
        max={max}
        value={value[0]}
        step={step}
        onChange={handleMinChange}
        onMouseUp={handleMouseUp}
        onTouchEnd={handleMouseUp}
        className="absolute top-[5px] w-full h-2 bg-transparent appearance-none cursor-pointer z-10 range-input"
        style={{
          pointerEvents: 'auto',
        }}
      />

      {/* Max Range Input */}
      <input
        type="range"
        min={min}
        max={max}
        value={value[1]}
        step={step}
        onChange={handleMaxChange}
        onMouseUp={handleMouseUp}
        onTouchEnd={handleMouseUp}
        className="absolute top-[5px] w-full h-2 bg-transparent appearance-none cursor-pointer z-10 range-input"
        style={{
          pointerEvents: 'auto',
        }}
      />

    </div>
  );
}
