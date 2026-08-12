import type { ColourFlag } from '../../../db/types';

export function SwatchPicker({
  flags,
  selectedFlagId,
  isReadOnly,
  onSelect,
}: {
  flags: ColourFlag[];
  selectedFlagId: string | null;
  isReadOnly: boolean;
  onSelect: (flagId: string | null) => void;
}) {
  return (
    <div className="swatch-picker">
      <button
        type="button"
        className={`swatch swatch-none ${selectedFlagId === null ? 'swatch-selected' : ''}`}
        title="No flag"
        disabled={isReadOnly}
        onClick={() => onSelect(null)}
      />
      {flags.map((flag) => (
        <button
          key={flag.id}
          type="button"
          className={`swatch ${selectedFlagId === flag.id ? 'swatch-selected' : ''}`}
          style={{ background: flag.colour }}
          title={flag.name}
          disabled={isReadOnly}
          onClick={() => onSelect(flag.id)}
        />
      ))}
    </div>
  );
}
