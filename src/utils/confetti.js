import confetti from 'canvas-confetti';

/**
 * Trigger a celebratory Diwali festival burst of golden, amber, and ruby confetti
 */
export function triggerDiwaliConfetti(origin = { x: 0.5, y: 0.6 }) {
  try {
    // Left cannon
    confetti({
      particleCount: 40,
      angle: 60,
      spread: 55,
      origin,
      colors: ['#F59E0B', '#EF4444', '#10B981', '#FBBF24', '#D97706'],
      ticks: 200,
      gravity: 1.1,
      scalar: 0.9,
      shapes: ['circle', 'square']
    });

    // Right cannon
    confetti({
      particleCount: 40,
      angle: 120,
      spread: 55,
      origin,
      colors: ['#F59E0B', '#EF4444', '#10B981', '#FBBF24', '#D97706'],
      ticks: 200,
      gravity: 1.1,
      scalar: 0.9,
      shapes: ['circle', 'square']
    });
  } catch (e) {
    // Graceful fallback if canvas is not supported
    console.debug('Confetti effect ignored:', e);
  }
}

/**
 * Trigger a mini sparkle burst when a product is added to cart
 */
export function triggerMiniSparkle(event) {
  try {
    let x = 0.5;
    let y = 0.5;
    if (event && event.clientX && event.clientY) {
      x = event.clientX / window.innerWidth;
      y = event.clientY / window.innerHeight;
    }
    confetti({
      particleCount: 18,
      spread: 45,
      startVelocity: 20,
      origin: { x, y },
      colors: ['#F59E0B', '#EF4444', '#FDE047'],
      ticks: 120,
      gravity: 1.2,
      scalar: 0.75,
      shapes: ['circle']
    });
  } catch (e) {
    console.debug('Mini sparkle effect ignored:', e);
  }
}
