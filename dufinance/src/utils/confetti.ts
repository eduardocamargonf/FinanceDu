import confetti from 'canvas-confetti';

export function fireDopamineConfetti() {
  try {
    // Left side burst
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.8 },
      colors: ['#11C76F', '#00E676', '#10B981', '#F59E0B', '#3B82F6', '#FFFFFF']
    });
    // Right side burst
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.8 },
      colors: ['#11C76F', '#00E676', '#10B981', '#F59E0B', '#3B82F6', '#FFFFFF']
    });
  } catch {
    // Ignore in unsupported environments
  }
}

export function fireGoalCelebration() {
  try {
    const end = Date.now() + 1.2 * 1000;
    const colors = ['#11C76F', '#FFD700', '#00E676', '#FFFFFF', '#6366F1'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.7 },
        colors: colors
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.7 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  } catch {
    // Ignore
  }
}
