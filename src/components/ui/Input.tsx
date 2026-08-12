import type { InputHTMLAttributes, LabelHTMLAttributes, PropsWithChildren } from 'react';
import './Input.css';

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="ui-input" {...props} />;
}

export function Field({ label, children, ...rest }: PropsWithChildren<{ label: string } & LabelHTMLAttributes<HTMLLabelElement>>) {
  return (
    <label className="ui-field" {...rest}>
      <span className="ui-field-label">{label}</span>
      {children}
    </label>
  );
}
