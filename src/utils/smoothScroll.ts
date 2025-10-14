/**
 * Ultra smooth scroll with easing - "ooopi goopi" effect
 * Uses easeInOutCubic for buttery smooth scrolling
 */

export const smoothScrollTo = (targetId: string, offset: number = 0) => {
  const element = document.getElementById(targetId);
  if (!element) return;

  const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  const duration = 800; // 0.8 seconds for smooth scroll - fast but smooth
  let start: number | null = null;

  // Easing function for smooth deceleration
  const easeInOutCubic = (t: number): number => {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const animation = (currentTime: number) => {
    if (start === null) start = currentTime;
    const timeElapsed = currentTime - start;
    const progress = Math.min(timeElapsed / duration, 1);

    const ease = easeInOutCubic(progress);
    window.scrollTo(0, startPosition + distance * ease);

    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    }
  };

  requestAnimationFrame(animation);
};

export const smoothScrollToTop = () => {
  const startPosition = window.pageYOffset;
  const duration = 700; // 0.7 seconds for scroll to top
  let start: number | null = null;

  const easeInOutCubic = (t: number): number => {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const animation = (currentTime: number) => {
    if (start === null) start = currentTime;
    const timeElapsed = currentTime - start;
    const progress = Math.min(timeElapsed / duration, 1);

    const ease = easeInOutCubic(progress);
    window.scrollTo(0, startPosition * (1 - ease));

    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    }
  };

  requestAnimationFrame(animation);
};
