import type { ReactElement } from 'react';

function WelcomeIllustration() {
  return (
    <svg viewBox="0 0 200 120" width="200" height="120">
      <line x1="100" y1="60" x2="50" y2="20" stroke="var(--text)" strokeWidth="3" />
      <line x1="100" y1="60" x2="150" y2="20" stroke="var(--text)" strokeWidth="1.5" strokeDasharray="6 4" />
      <line x1="100" y1="60" x2="60" y2="100" stroke="var(--text)" strokeWidth="1.5" strokeDasharray="2 4" />
      <circle cx="100" cy="60" r="22" fill="var(--accent)" />
      <circle cx="50" cy="20" r="14" fill="#f5c518" stroke="var(--border)" strokeWidth="1.5" />
      <circle cx="150" cy="20" r="14" fill="#9ca3af" stroke="var(--border)" strokeWidth="1.5" />
      <circle cx="60" cy="100" r="14" fill="#3b82f6" stroke="var(--border)" strokeWidth="1.5" />
    </svg>
  );
}

function NewVersionIllustration() {
  return (
    <div className="tutorial-mock-card">
      <span className="tutorial-mock-card-label">Ecomap versions</span>
      <button type="button" className="btn btn-primary" disabled>+ New version</button>
    </div>
  );
}

function QuickAddIllustration() {
  return (
    <div className="quick-add-bar tutorial-mock-quick-add">
      <button type="button" className="quick-add-btn" disabled>+ Family</button>
      <button type="button" className="quick-add-btn" disabled>+ Health</button>
      <button type="button" className="quick-add-btn" disabled>+ Peer</button>
    </div>
  );
}

function ColourFlagIllustration() {
  return (
    <div className="swatch-picker tutorial-mock-swatches">
      <button type="button" className="swatch swatch-none" disabled aria-label="No flag" />
      <button type="button" className="swatch swatch-selected" style={{ background: '#f5c518' }} disabled aria-label="Immediate family" />
      <button type="button" className="swatch" style={{ background: '#3b82f6' }} disabled aria-label="Trusted ally" />
      <button type="button" className="swatch" style={{ background: '#dc2626' }} disabled aria-label="Source of risk" />
    </div>
  );
}

function RelationshipLinesIllustration() {
  return (
    <svg viewBox="0 0 200 90" width="200" height="90">
      <line x1="10" y1="15" x2="120" y2="15" stroke="var(--accent)" strokeWidth="4" />
      <text x="130" y="19" fontSize="11" fill="var(--text)">strong</text>
      <line x1="10" y1="42" x2="120" y2="42" stroke="var(--text)" strokeWidth="4" strokeDasharray="10 6" />
      <text x="130" y="46" fontSize="11" fill="var(--text)">stressful</text>
      <line x1="10" y1="69" x2="120" y2="69" stroke="var(--text)" strokeWidth="2" strokeDasharray="2 5" />
      <text x="130" y="73" fontSize="11" fill="var(--text)">absent</text>
    </svg>
  );
}

function ModeToggleIllustration() {
  return (
    <div className="mode-toggle">
      <button type="button" className="mode-toggle-btn mode-toggle-btn-active" disabled>Live session</button>
      <button type="button" className="mode-toggle-btn" disabled>Desk review</button>
    </div>
  );
}

function FinaliseIllustration() {
  return (
    <div className="tutorial-mock-finalise">
      <span className="version-status version-status-finalised">finalised</span>
      <span className="tutorial-mock-arrow">→</span>
      <span className="version-status">draft (copy)</span>
    </div>
  );
}

export interface TutorialStep {
  title: string;
  description: string;
  Illustration: () => ReactElement;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: 'Welcome to Ecomap',
    description:
      'Ecomap helps you build, store, and revisit ecomaps for your clients as part of ongoing assessment work. This quick tour covers the basics — you can skip it any time.',
    Illustration: WelcomeIllustration,
  },
  {
    title: 'Create an ecomap version',
    description:
      'Each client can have several ecomap versions over time (an initial assessment, a 6-month review, and so on). Starting a new version auto-creates the central node for you.',
    Illustration: NewVersionIllustration,
  },
  {
    title: 'Quick-add people by category',
    description:
      'The quick-add bar adds a new node pre-filled with a category, placed automatically so you don’t have to arrange it yourself. Categories are fully customisable in Settings.',
    Illustration: QuickAddIllustration,
  },
  {
    title: 'Colour flags',
    description:
      'Click a swatch directly on a node to tag it — trusted, at risk, inactive, whatever your own convention is. It’s a separate, faster signal from category, meant for scanning the map at a glance.',
    Illustration: ColourFlagIllustration,
  },
  {
    title: 'Drawing relationships',
    description:
      'Shift+drag from one node to another to draw a relationship, then pick its type and direction. Line style (solid, dashed, dotted) always shows the relationship type, so it reads clearly even in black and white.',
    Illustration: RelationshipLinesIllustration,
  },
  {
    title: 'Live vs Desk mode',
    description:
      'Live mode keeps the screen minimal for fast entry during a session with a client. Desk mode adds a side panel with notes, filters, and connection stats for reviewing afterwards.',
    Illustration: ModeToggleIllustration,
  },
  {
    title: 'Finalising & new versions',
    description:
      'Finalising a version makes it permanently read-only, protecting the record. To keep building on it later, use "Create new version" — it duplicates everything into a fresh, editable draft.',
    Illustration: FinaliseIllustration,
  },
];
