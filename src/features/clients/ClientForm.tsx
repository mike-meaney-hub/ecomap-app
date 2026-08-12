import { useState, type FormEvent } from 'react';
import { Field, Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export interface ClientFormValues {
  displayName: string;
  dobOrAgeBand: string;
  caseReference: string;
  assignedPractitioner: string;
}

const EMPTY: ClientFormValues = {
  displayName: '',
  dobOrAgeBand: '',
  caseReference: '',
  assignedPractitioner: '',
};

export function ClientForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
}: {
  initial?: ClientFormValues;
  onSubmit: (values: ClientFormValues) => void;
  onCancel: () => void;
  submitLabel?: string;
}) {
  const [values, setValues] = useState<ClientFormValues>(initial ?? EMPTY);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!values.displayName.trim()) return;
    onSubmit(values);
  }

  return (
    <form className="client-form" onSubmit={handleSubmit}>
      <Field label="Display name / initials">
        <Input
          value={values.displayName}
          onChange={(e) => setValues({ ...values, displayName: e.target.value })}
          placeholder="e.g. J.S. or Smith family"
          required
        />
      </Field>
      <Field label="Date of birth / age band">
        <Input
          value={values.dobOrAgeBand}
          onChange={(e) => setValues({ ...values, dobOrAgeBand: e.target.value })}
          placeholder="e.g. 8-12 years"
        />
      </Field>
      <Field label="Case / reference number">
        <Input
          value={values.caseReference}
          onChange={(e) => setValues({ ...values, caseReference: e.target.value })}
        />
      </Field>
      <Field label="Assigned practitioner">
        <Input
          value={values.assignedPractitioner}
          onChange={(e) => setValues({ ...values, assignedPractitioner: e.target.value })}
        />
      </Field>
      <div className="client-form-actions">
        <Button type="submit" variant="primary">{submitLabel}</Button>
        <Button type="button" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
