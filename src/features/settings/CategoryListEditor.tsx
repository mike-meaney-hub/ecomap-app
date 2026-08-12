import { useState } from 'react';
import { useCategories } from '../../hooks/useCategories';
import { createCategory, renameCategory, reorderCategory, archiveCategory } from '../../db/repositories/categories';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export function CategoryListEditor() {
  const categories = useCategories();
  const [newName, setNewName] = useState('');

  async function move(index: number, direction: -1 | 1) {
    if (!categories) return;
    const target = index + direction;
    if (target < 0 || target >= categories.length) return;
    const a = categories[index];
    const b = categories[target];
    await Promise.all([
      reorderCategory(a.id, b.sortOrder),
      reorderCategory(b.id, a.sortOrder),
    ]);
  }

  return (
    <div className="lookup-editor">
      <h2>Categories</h2>
      <ul className="lookup-list">
        {categories?.map((category, i) => (
          <li key={category.id} className="lookup-row">
            <Input
              defaultValue={category.name}
              onBlur={(e) => {
                if (e.target.value.trim() && e.target.value !== category.name) {
                  renameCategory(category.id, e.target.value.trim());
                }
              }}
            />
            <div className="lookup-row-actions">
              <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>↑</button>
              <button type="button" aria-label="Move down" disabled={i === categories.length - 1} onClick={() => move(i, 1)}>↓</button>
              <Button variant="danger" onClick={() => archiveCategory(category.id)}>Retire</Button>
            </div>
          </li>
        ))}
      </ul>
      <form
        className="lookup-add-form"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!newName.trim()) return;
          await createCategory(newName.trim());
          setNewName('');
        }}
      >
        <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New category name" />
        <Button type="submit" variant="primary">Add</Button>
      </form>
    </div>
  );
}
