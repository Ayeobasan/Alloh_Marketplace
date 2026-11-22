import type { User } from '@/types';

/**
 * Localized Nigerian Naira formatting
 */
export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '₦0.00';
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0, // In agricultural context, whole Naira or standard dec is good
  }).format(num);
}

/**
 * Sanitizes phone numbers and generates robust WhatsApp links (wa.me/234...)
 * Handles:
 *  - Stripping spaces, brackets, dashes
 *  - Replacing leading zero with '234'
 *  - Ensuring country code prefix is correctly appended
 */
export function getWhatsAppLink(phone: string, text?: string): string {
  if (!phone) return '#';
  
  // Strip all non-numeric characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Replace leading 0 with Nigerian country code 234
  if (cleaned.startsWith('0')) {
    cleaned = '234' + cleaned.substring(1);
  }
  
  // If it is 10 digits (e.g. 8031234567) without 234 or 0, prefix 234
  if (cleaned.length === 10 && !cleaned.startsWith('234')) {
    cleaned = '234' + cleaned;
  }
  
  const baseUrl = `https://wa.me/${cleaned}`;
  if (text) {
    return `${baseUrl}?text=${encodeURIComponent(text)}`;
  }
  return baseUrl;
}

export type KycStatus = 'pending' | 'approved' | 'rejected';

const isKycStatus = (value: unknown): value is KycStatus =>
  value === 'pending' || value === 'approved' || value === 'rejected';

// The backend has returned KYC in several shapes: an object, a bare string, or flat fields.
type KycSource = Pick<User, 'kyc_status' | 'kycStatus'> & { kyc?: User['kyc'] | string };

/**
 * Resolves KYC status robustly across various data structures (objects, strings, flat variables).
 * Returns null when the user carries no KYC data — that is "unknown", never "verified".
 */
export function getKycStatus(user: KycSource | null | undefined): KycStatus | null {
  if (!user) return null;

  // 1. If user.kyc is an object, check user.kyc.status
  if (user.kyc && typeof user.kyc === 'object' && isKycStatus(user.kyc.status)) {
    return user.kyc.status;
  }

  // 2. If user.kyc is a string itself (e.g. "approved")
  if (isKycStatus(user.kyc)) {
    return user.kyc;
  }

  // 3. Flat properties
  const flat = user.kyc_status || user.kycStatus;
  if (isKycStatus(flat)) {
    return flat;
  }

  return null;
}

