import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '',
);

export const stripeAppearance = {
  theme: 'night' as const,
  variables: {
    colorPrimary: '#ef4444',
    colorBackground: '#1e293b',
    colorText: '#f8fafc',
    fontFamily: 'Outfit, sans-serif',
  },
};

export function isStripeConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
}

/** Elements options khi đã có clientSecret (SetupIntent / PaymentIntent). */
export function buildStripeElementsOptions(clientSecret: string) {
  return {
    clientSecret,
    appearance: stripeAppearance,
  };
}

export const cardPaymentElementOptions = {
  layout: {
    type: 'accordion' as const,
    defaultCollapsed: false,
    radios: 'auto' as const,
    spacedAccordionItems: false,
  },
  savedPaymentMethodOptions: {
    allowRedisplayFilters: ['always', 'limited', 'unspecified'] as const,
  },
};
