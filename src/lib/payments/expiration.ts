import {
  PaymentProvider,
  PaymentStatus,
} from "@/generated/prisma/enums";

export const MOMO_PAYMENT_EXPIRE_MINUTES = 120;

export function getPaymentExpiresAt(createdAt: Date) {
  return new Date(
    createdAt.getTime() + MOMO_PAYMENT_EXPIRE_MINUTES * 60 * 1000,
  );
}

type MomoPaymentExpiryInput = {
  provider?: PaymentProvider | null;
  status: PaymentStatus;
  createdAt?: Date | null;
};

export function isMomoPaymentExpired({
  provider,
  status,
  createdAt,
}: MomoPaymentExpiryInput) {
  if (
    provider !== PaymentProvider.MOMO ||
    status !== PaymentStatus.PENDING ||
    !createdAt
  ) {
    return false;
  }

  return Date.now() >= getPaymentExpiresAt(createdAt).getTime();
}
