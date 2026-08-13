import { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { markTutorialSeen } from '../../lib/tutorialPreference';
import { TUTORIAL_STEPS } from './tutorialSteps';
import './tutorial.css';

export function TutorialModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const isFirst = step === 0;
  const isLast = step === TUTORIAL_STEPS.length - 1;
  const current = TUTORIAL_STEPS[step];

  function handleClose() {
    markTutorialSeen();
    onClose();
  }

  return (
    <Modal onClose={handleClose} labelledBy="tutorial-title">
      <div className="tutorial-modal">
        <div className="tutorial-header">
          <h2 id="tutorial-title">{current.title}</h2>
          <button type="button" className="tutorial-skip" onClick={handleClose}>Skip tutorial</button>
        </div>

        <div className="tutorial-illustration">
          <current.Illustration />
        </div>

        <p className="tutorial-description">{current.description}</p>

        <div className="tutorial-footer">
          <span className="tutorial-progress">{step + 1} of {TUTORIAL_STEPS.length}</span>
          <div className="tutorial-nav">
            <Button type="button" onClick={() => setStep((s) => s - 1)} disabled={isFirst}>Back</Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => (isLast ? handleClose() : setStep((s) => s + 1))}
            >
              {isLast ? 'Done' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
