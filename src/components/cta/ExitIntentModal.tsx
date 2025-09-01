import React, { useState, useEffect } from 'react';
import { EmailCaptureModal } from './EmailCaptureModal';

interface ExitIntentModalProps {
  enabled?: boolean;
  delay?: number; // Delay before showing modal after exit intent (ms)
  title?: string;
  description?: string;
  incentive?: string;
}

export function ExitIntentModal({
  enabled = true,
  delay = 500,
  title = "Wait! Don't Miss Out",
  description = "Before you go, join our newsletter for exclusive insights and tips delivered weekly.",
  incentive = "🎁 Get our free Web Development Checklist as a welcome gift!"
}: ExitIntentModalProps) {
  const [showModal, setShowModal] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    // Check if user has already dismissed exit intent today
    const dismissedToday = localStorage.getItem('exit-intent-dismissed');
    const today = new Date().toDateString();
    
    if (dismissedToday === today) {
      return;
    }

    // Check if user is already subscribed
    const isSubscribed = localStorage.getItem('newsletter-subscribed');
    if (isSubscribed) {
      return;
    }

    let timeoutId: NodeJS.Timeout;

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse leaves the top of the viewport
      if (e.clientY <= 0 && !hasTriggered) {
        timeoutId = setTimeout(() => {
          setShowModal(true);
          setHasTriggered(true);
        }, delay);
      }
    };

    const handleMouseEnter = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [enabled, delay, hasTriggered]);

  const handleClose = () => {
    setShowModal(false);
    // Remember dismissal for today
    localStorage.setItem('exit-intent-dismissed', new Date().toDateString());
  };

  const handleSuccess = () => {
    localStorage.setItem('newsletter-subscribed', 'true');
  };

  return (
    <EmailCaptureModal
      isOpen={showModal}
      onClose={handleClose}
      title={title}
      description={description}
      incentive={incentive}
      source="exit_intent"
    />
  );
}