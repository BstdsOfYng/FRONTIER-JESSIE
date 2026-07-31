import { PresetScenario } from '../types';

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'jest-discount-calc',
    title: 'Jest Unit Test Failure: Tiered Discount Calculation',
    description: 'Checkout volume discount calculation fails on edge case boundaries due to off-by-one comparison operator and missing floating point rounding.',
    category: 'Jest Unit Test Failure',
    repoOwner: 'acme-inc',
    repoName: 'checkout-service',
    prNumber: 142,
    prTitle: 'feat: Add tiered volume discount logic for enterprise accounts',
    branch: 'feat/volume-discounts',
    author: 'alex-dev',
    filename: 'src/utils/discount.ts',
    buggyCode: `export interface CartItem {
  id: string;
  price: number;
  quantity: number;
}

export function calculateVolumeDiscount(items: CartItem[]): number {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  let discountPercentage = 0;

  // BUG: uses > instead of >= 50 and 100, causing threshold boundary buyers to miss discounts
  if (totalItems > 100) {
    discountPercentage = 0.20;
  } else if (totalItems > 50) {
    discountPercentage = 0.10;
  } else if (totalItems > 10) {
    discountPercentage = 0.05;
  }

  const discountAmount = subtotal * discountPercentage;
  
  // BUG: Missing Math.round to 2 decimal places, causing precision failures like 14.999999999999998
  return discountAmount;
}`,
    failingTestCode: `import { calculateVolumeDiscount } from './discount';

describe('calculateVolumeDiscount', () => {
  test('applies 10% discount for exactly 50 items', () => {
    const items = [{ id: '1', price: 10, quantity: 50 }];
    const discount = calculateVolumeDiscount(items);
    expect(discount).toBe(50); // 10% of $500 = $50
  });

  test('applies 20% discount for exactly 100 items with precise rounding', () => {
    const items = [{ id: '1', price: 19.99, quantity: 100 }];
    const discount = calculateVolumeDiscount(items);
    expect(discount).toBe(399.8); // 20% of $1999 = $399.80
  });
});`,
    errorMessage: 'FAIL src/utils/discount.test.ts > calculateVolumeDiscount > applies 10% discount for exactly 50 items',
    stackTrace: `FAIL  src/utils/discount.test.ts
  ✕ calculateVolumeDiscount > applies 10% discount for exactly 50 items (12 ms)
  ✕ calculateVolumeDiscount > applies 20% discount for exactly 100 items with precise rounding (4 ms)

  ● calculateVolumeDiscount › applies 10% discount for exactly 50 items

    expect(received).toBe(expected) // Object.is equality

    Expected: 50
    Received: 25

      5 |     const items = [{ id: '1', price: 10, quantity: 50 }];
      6 |     const discount = calculateVolumeDiscount(items);
    > 7 |     expect(discount).toBe(50);
        |                      ^
      at Object.<anonymous> (src/utils/discount.test.ts:7:22)`
  },
  {
    id: 'ts-stripe-payload',
    title: 'TypeScript Compiler Error: Stripe Webhook Schema',
    description: 'TS2339 error in payment gateway handler due to unsafe property access on union type without type narrowing.',
    category: 'TypeScript Type Mismatch',
    repoOwner: 'fintech-corp',
    repoName: 'payment-gateway',
    prNumber: 89,
    prTitle: 'refactor: Upgrade Stripe SDK v12 payment event parser',
    branch: 'refactor/stripe-v12',
    author: 'sarah-backend',
    filename: 'src/services/stripe.ts',
    buggyCode: `export interface StripeCharge {
  id: string;
  amount: number;
  payment_method_details?: {
    type: string;
    card?: {
      brand: string;
      last4: string;
    };
  } | string;
}

export function formatCardSummary(charge: StripeCharge): string {
  const details = charge.payment_method_details;

  if (!details) {
    return 'Unknown Payment Method';
  }

  // BUG: TypeScript compile error TS2339 - 'card' does not exist on type 'string | { type: string; card?: ... }'
  // Missing typeof details === 'object' check before accessing details.card
  const brand = details.card.brand.toUpperCase();
  const last4 = details.card.last4;

  return \`\${brand} ending in \${last4}\`;
}`,
    failingTestCode: `import { formatCardSummary } from './stripe';

test('formats card charge details correctly', () => {
  const summary = formatCardSummary({
    id: 'ch_123',
    amount: 2500,
    payment_method_details: {
      type: 'card',
      card: { brand: 'visa', last4: '4242' }
    }
  });
  expect(summary).toBe('VISA ending in 4242');
});`,
    errorMessage: 'error TS2339: Property \'card\' does not exist on type \'string | { type: string; card?: { brand: string; last4: string; } | undefined; }\'.',
    stackTrace: `src/services/stripe.ts:18:25 - error TS2339: Property 'card' does not exist on type 'string | { type: string; card?: { brand: string; last4: string; } | undefined; }'.

18   const brand = details.card.brand.toUpperCase();
                         ~~~~

src/services/stripe.ts:19:23 - error TS2339: Property 'card' does not exist on type 'string | { type: string; card?: { brand: string; last4: string; } | undefined; }'.

19   const last4 = details.card.last4;
                       ~~~~`
  },
  {
    id: 'eslint-missing-export',
    title: 'ESLint Syntax Error: Unexported Custom React Hook',
    description: 'Build pipeline fails lint check because custom hook is defined and used internally but missing export keywords, breaking consumption.',
    category: 'ESLint Syntax Error',
    repoOwner: 'dev-corp',
    repoName: 'dashboard-ui',
    prNumber: 214,
    prTitle: 'feat: Extract useNavHistory hook for router breadcrumbs',
    branch: 'feat/nav-breadcrumbs',
    author: 'jordan-fe',
    filename: 'src/hooks/useNav.ts',
    buggyCode: `import { useState, useEffect } from 'react';

interface NavState {
  currentPath: string;
  history: string[];
}

// BUG: Missing export keyword, causing ESLint 'no-unused-vars' and import resolution failure in consumer components
function useNavHistory() {
  const [navState, setNavState] = useState<NavState>({
    currentPath: '/',
    history: ['/']
  });

  const pushPath = (path: string) => {
    setNavState(prev => ({
      currentPath: path,
      history: [...prev.history, path]
    }));
  };

  return { ...navState, pushPath };
}`,
    failingTestCode: `import { useNavHistory } from './useNav';

test('useNavHistory exposes navigation state', () => {
  expect(typeof useNavHistory).toBe('function');
});`,
    errorMessage: 'ESLint: Module \'./useNav\' has no exported member \'useNavHistory\'.',
    stackTrace: `[eslint] 
/app/src/hooks/useNav.ts
  9:10  error  'useNavHistory' is defined but never exported  @typescript-eslint/no-unused-vars

/app/src/components/Breadcrumbs.tsx
  3:10  error  Module '"../hooks/useNav"' has no exported member 'useNavHistory'  import/no-unresolved

✖ 2 problems (2 errors, 0 warnings)`
  },
  {
    id: 'pytest-null-key',
    title: 'Pytest Failure: Unhandled Null User Metadata in Python ETL',
    description: 'Python data pipeline service throws KeyError during user metadata payload parsing when optional profile fields are omitted.',
    category: 'Pytest Assertion Failure',
    repoOwner: 'data-labs',
    repoName: 'pipeline-worker',
    prNumber: 57,
    prTitle: 'fix: Add optional social handle parsing in ETL worker',
    branch: 'fix/etl-social-handles',
    author: 'michaela-data',
    filename: 'services/parser.py',
    buggyCode: `from typing import Dict, Any

def extract_user_profile(payload: Dict[str, Any]) -> Dict[str, str]:
    user_data = payload.get("data", {})
    
    # BUG: Direct dictionary lookup payload["user_id"] throws KeyError if key missing
    # Should use .get() with fallback or null guard
    user_id = user_data["user_id"]
    email = user_data.get("email", "unknown@example.com")
    
    # BUG: Assumes 'profile' key always exists inside user_data
    handle = user_data["profile"]["twitter_handle"] if "profile" in user_data else "N/A"
    
    return {
        "user_id": str(user_id),
        "email": email,
        "handle": handle
    }`,
    failingTestCode: `import pytest
from services.parser import extract_user_profile

def test_extract_user_profile_with_missing_keys():
    # Payload missing 'user_id' inside data object
    raw_payload = {"data": {"email": "test@demo.com"}}
    profile = extract_user_profile(raw_payload)
    assert profile["user_id"] == "anonymous"
    assert profile["email"] == "test@demo.com"`,
    errorMessage: 'KeyError: \'user_id\' during pytest test_extract_user_profile_with_missing_keys',
    stackTrace: `FAILED tests/test_parser.py::test_extract_user_profile_with_missing_keys - KeyError: 'user_id'

___________________________ test_extract_user_profile_with_missing_keys ___________________________

    def test_extract_user_profile_with_missing_keys():
        raw_payload = {"data": {"email": "test@demo.com"}}
>       profile = extract_user_profile(raw_payload)

tests/test_parser.py:6: 
_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _

payload = {'data': {'email': 'test@demo.com'}}

    def extract_user_profile(payload: Dict[str, Any]) -> Dict[str, str]:
        user_data = payload.get("data", {})
>       user_id = user_data["user_id"]
E       KeyError: 'user_id'

services/parser.py:8: KeyError`
  }
];
