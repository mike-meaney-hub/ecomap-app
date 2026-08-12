import { useState } from 'react';
import { useFlags } from '../../hooks/useFlags';
import { createFlag, renameFlag, reorderFlag, archiveFlag } from '../../db/repositories/flags';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export function FlagPaletteEditor() {
  const flags = useFlags();
  const [newName, setNewName] = useState('');
  const [newColour, setNewColour] = useState('#3b82f6');

  async function move(index: number, direction: -1 | 1) {
    if (!flags) return;
    const target = index + direction;
    if (target < 0 || target >= flags.length) return;
    const a = flags[index];
    const b = flags[target];
    await Promise.all([
      reorderFlag(a.id, b.sortOrder),
      reorderFlag(b.id, a.sortOrder),
    ]);
  }

  return (
    <div className="lookup-editor">
      <h2>Colour flags</h2>
      <ul className="lookup-list">
        {flags?.map((flag, i) => (
          <li key={flag.id} className="lookup-row">
            <input
              type="color"
              className="colour-input"
              defaultValue={flag.colour}
              onBlur={(e) => {
                if (e.target.value !== flag.colour) renameFlag(flag.id, flag.name, e.target.value);
              }}
            />
            <Input
              defaultValue={flag.name}
              onBlur={(e) => {
                if (e.target.value.trim() && e.target.value !== flag.name) {
                  renameFlag(flag.id, e.target.value.trim(), flag.colour);
                }
              }}
            />
            <div className="lookup-row-actions">
              <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>↑</button>
              <button type="button" aria-label="Move down" disabled={i === flags.length - 1} onClick={() => move(i, 1)}>↓</button>
              <Button variant="danger" onClick={() => archiveFlag(flag.id)}>Retire</Button>
            </div>
          </li>
        ))}
      </ul>
      <form
        className="lookup-add-form"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!newName.trim()) return;
          await createFlag(newName.trim(), newColour);
          setNewName('');
        }}
      >
        <input type="color" className="colour-input" value={newColour} onChange={(e) => setNewColour(e.target.value)} />
        <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New flag meaning" />
        <Button type="submit" variant="primary">Add</Button>
      </form>
    </div>
  );
}
