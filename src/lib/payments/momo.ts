import "server-only";

import { createHmac } from "node:crypto";

type MomoCreatePaymentInput = {
  orderId: string;
  requestId: string;
  amount: number;
  orderInfo: string;
  redirectUrl: string;
  ipnUrl: string;
  extraData?: string;
};

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export function getMomoConfig() {
  return {
    endpoint: requireEnv("MOMO_ENDPOINT"),
    partnerCode: requireEnv("MOMO_PARTNER_CODE"),
    accessKey: requireEnv("MOMO_ACCESS_KEY"),
    secretKey: requireEnv("MOMO_SECRET_KEY"),
  };
}

export function createMomoSignature(rawSignature: string, secretKey: string) {
  return createHmac("sha256", secretKey)
    .update(rawSignature)
    .digest("hex");
}

export function buildMomoCreatePaymentPayload(input: MomoCreatePaymentInput) {
  const { endpoint, partnerCode, accessKey, secretKey } = getMomoConfig();

  const requestType = "captureWallet";
  const extraData = input.extraData ?? "";
  const lang = "vi";

  const rawSignature =
    `accessKey=${accessKey}` +
    `&amount=${input.amount}` +
    `&extraData=${extraData}` +
    `&ipnUrl=${input.ipnUrl}` +
    `&orderId=${input.orderId}` +
    `&orderInfo=${input.orderInfo}` +
    `&partnerCode=${partnerCode}` +
    `&redirectUrl=${input.redirectUrl}` +
    `&requestId=${input.requestId}` +
    `&requestType=${requestType}`;

  return {
    endpoint,
    payload: {
      partnerCode,
      requestId: input.requestId,
      amount: input.amount,
      orderId: input.orderId,
      orderInfo: input.orderInfo,
      redirectUrl: input.redirectUrl,
      ipnUrl: input.ipnUrl,
      requestType,
      extraData,
      lang,
      signature: createMomoSignature(rawSignature, secretKey),
    },
  };
}

export type MomoIpnPayload = {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: number;
  orderInfo: string;
  orderType: string;
  transId: number;
  resultCode: number;
  message: string;
  payType: string;
  responseTime: number;
  extraData: string;
  signature: string;
};

export function buildMomoIpnRawSignature(payload: MomoIpnPayload) {
  const { accessKey } = getMomoConfig();

  return (
    `accessKey=${accessKey}` +
    `&amount=${payload.amount}` +
    `&extraData=${payload.extraData}` +
    `&message=${payload.message}` +
    `&orderId=${payload.orderId}` +
    `&orderInfo=${payload.orderInfo}` +
    `&orderType=${payload.orderType}` +
    `&partnerCode=${payload.partnerCode}` +
    `&payType=${payload.payType}` +
    `&requestId=${payload.requestId}` +
    `&responseTime=${payload.responseTime}` +
    `&resultCode=${payload.resultCode}` +
    `&transId=${payload.transId}`
  );
}

export function verifyMomoIpnSignature(payload: MomoIpnPayload) {
  const { secretKey } = getMomoConfig();
  const rawSignature = buildMomoIpnRawSignature(payload);
  const expectedSignature = createMomoSignature(rawSignature, secretKey);

  return expectedSignature === payload.signature;
}