import { nurseryAPI } from '../services/api';
import { useState } from 'react';

export const PAYMENT_REQUIRED_MESSAGE = 'Please configure at least one payment method to continue.';
const UPI_RE = /^[a-z0-9][a-z0-9.\-_]{1,255}@[a-z][a-z0-9]{1,63}$/;

const STATUS_LABEL = {
  unverified: 'Unverified',
  pending_review: 'Pending review',
  verified: 'Verified',
  rejected: 'Rejected',
  not_started: 'Not started',
  pending: 'Onboarding pending',
  failed: 'Onboarding failed',
};

export function emptyPayments() {
  return {
    upi: { enabled: false, upiId: '', verificationStatus: 'unverified' },
    qr: { enabled: false, imageData: '', fileName: '', hasImage: false, verificationStatus: 'unverified' },
    gateway: {
      enabled: false,
      accountHolder: '',
      bankName: '',
      ifsc: '',
      accountNumber: '',
      accountLast4: '',
      keepExistingAccount: false,
      verificationStatus: 'unverified',
      onboardingStatus: 'not_started',
    },
  };
}

export function paymentsFromNursery(methods) {
  const base = emptyPayments();
  if (!methods) return base;
  return {
    upi: {
      enabled: Boolean(methods.upi?.enabled),
      upiId: methods.upi?.upiId || '',
      verificationStatus: methods.upi?.verificationStatus || 'unverified',
    },
    qr: {
      enabled: Boolean(methods.qr?.enabled),
      imageData: methods.qr?.imageData || '',
      fileName: methods.qr?.fileName || '',
      hasImage: Boolean(methods.qr?.hasImage || methods.qr?.imageData),
      verificationStatus: methods.qr?.verificationStatus || 'unverified',
    },
    gateway: {
      enabled: Boolean(methods.gateway?.enabled),
      accountHolder: methods.gateway?.accountHolder || '',
      bankName: methods.gateway?.bankName || '',
      ifsc: methods.gateway?.ifsc || '',
      accountNumber: '',
      accountLast4: methods.gateway?.accountLast4 || '',
      keepExistingAccount: Boolean(methods.gateway?.accountLast4),
      verificationStatus: methods.gateway?.verificationStatus || 'unverified',
      onboardingStatus: methods.gateway?.onboardingStatus || 'not_started',
    },
  };
}

export function paymentReady(value) {
  const upi = Boolean(value?.upi?.enabled)
    && UPI_RE.test(String(value.upi.upiId || '').trim().toLowerCase())
    && value.upi.verificationStatus !== 'rejected';
  const qr = Boolean(value?.qr?.enabled)
    && Boolean(value.qr.imageData || value.qr.hasImage)
    && value.qr.verificationStatus !== 'rejected';
  const gateway = Boolean(value?.gateway?.enabled)
    && (value.gateway.verificationStatus === 'verified' || value.gateway.onboardingStatus === 'verified');
  return { upi, qr, gateway, any: upi || qr || gateway };
}

export function paymentPayload(value) {
  return {
    upi: { enabled: Boolean(value.upi.enabled), upiId: String(value.upi.upiId || '').trim() },
    qr: {
      enabled: Boolean(value.qr.enabled),
      imageData: value.qr.imageData || '',
      fileName: value.qr.fileName || '',
      keepExisting: Boolean(value.qr.enabled && !value.qr.imageData && value.qr.hasImage),
    },
    gateway: {
      enabled: Boolean(value.gateway.enabled),
      accountHolder: value.gateway.accountHolder,
      bankName: value.gateway.bankName,
      ifsc: value.gateway.ifsc,
      accountNumber: value.gateway.accountNumber,
      keepExistingAccount: Boolean(value.gateway.enabled && !value.gateway.accountNumber && value.gateway.keepExistingAccount),
    },
  };
}

function Status({ value }) {
  if (!value) return null;
  return <span className="text-xs text-muted">{STATUS_LABEL[value] || value}</span>;
}

export default function ShopPaymentMethods({ value, onChange }) {
  const [qrError, setQrError] = useState('');
  const [gatewayMessage, setGatewayMessage] = useState('');
  const [checking, setChecking] = useState(false);
  const ready = paymentReady(value);

  const patch = (method, fields) => onChange({ ...value, [method]: { ...value[method], ...fields } });

  const onQrFile = (event) => {
    const file = event.target.files?.[0];
    setQrError('');
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setQrError('Upload a JPEG, PNG, or WebP image.');
      return;
    }
    if (file.size > 1_500_000) {
      setQrError('QR image must be under 1.5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      patch('qr', {
        enabled: true,
        imageData: String(reader.result || ''),
        fileName: file.name,
        hasImage: true,
        verificationStatus: 'pending_review',
      });
    };
    reader.readAsDataURL(file);
  };

  const verifyGateway = async () => {
    setChecking(true);
    setGatewayMessage('');
    try {
      const res = await nurseryAPI.onboardGateway({
        accountHolder: value.gateway.accountHolder,
        bankName: value.gateway.bankName,
        ifsc: value.gateway.ifsc,
        accountNumber: value.gateway.accountNumber,
      });
      patch('gateway', {
        enabled: true,
        verificationStatus: res.data.verificationStatus,
        onboardingStatus: res.data.onboardingStatus,
      });
      setGatewayMessage(res.data.message);
    } catch (error) {
      setGatewayMessage(error.response?.data?.message || 'Payment gateway onboarding could not be completed.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-display">Payment methods</h2>
        <p className="mt-1 text-sm text-muted">Choose one or more. At least one valid method is required before the shop can be submitted for approval.</p>
        <p className="mt-1 text-sm text-muted">A saved UPI ID or QR image is not proof that the payment account has been verified. A super admin reviews it with the shop application.</p>
      </div>

      <div className="rounded-2xl border border-line p-4">
        <label className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-3 font-medium">
            <input type="checkbox" checked={value.upi.enabled} onChange={(event) => patch('upi', { enabled: event.target.checked })} />
            UPI ID
          </span>
          <Status value={value.upi.enabled ? value.upi.verificationStatus : ''} />
        </label>
        {value.upi.enabled && (
          <div className="mt-3 space-y-2">
            <input
              className="input"
              placeholder="shopname@okicici"
              value={value.upi.upiId}
              onChange={(event) => patch('upi', { upiId: event.target.value, verificationStatus: 'pending_review' })}
            />
            {value.upi.upiId && !ready.upi && value.upi.verificationStatus !== 'rejected' && (
              <p className="text-xs text-red-600">Enter a valid UPI ID.</p>
            )}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-line p-4">
        <label className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-3 font-medium">
            <input type="checkbox" checked={value.qr.enabled} onChange={(event) => patch('qr', { enabled: event.target.checked })} />
            GPay / UPI QR code
          </span>
          <Status value={value.qr.enabled ? value.qr.verificationStatus : ''} />
        </label>
        {value.qr.enabled && (
          <div className="mt-3 space-y-2">
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={onQrFile} />
            {value.qr.imageData && (
              <img src={value.qr.imageData} alt="UPI QR code" className="h-28 w-28 rounded-lg object-contain bg-white" />
            )}
            {value.qr.hasImage && !value.qr.imageData && <p className="text-xs text-muted">A QR image is already saved. Upload a new file to replace it.</p>}
            {qrError && <p className="text-xs text-red-600">{qrError}</p>}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-line p-4">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            className="mt-1"
            checked={value.gateway.enabled}
            onChange={(event) => patch('gateway', { enabled: event.target.checked })}
          />
          <span className="min-w-0 flex-1">
            <span className="flex items-center justify-between gap-2">
              <span className="font-medium">Bank account / payment gateway</span>
              <Status value={value.gateway.enabled ? value.gateway.verificationStatus : ''} />
            </span>
            <span className="mt-1 block text-xs text-muted">This counts only after gateway onboarding succeeds or a super admin verifies the account.</span>
          </span>
        </label>
        {value.gateway.enabled && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <input className="input" placeholder="Account holder" value={value.gateway.accountHolder} onChange={(event) => patch('gateway', { accountHolder: event.target.value, verificationStatus: 'pending_review', onboardingStatus: 'pending' })} />
            <input className="input" placeholder="Bank name" value={value.gateway.bankName} onChange={(event) => patch('gateway', { bankName: event.target.value, verificationStatus: 'pending_review', onboardingStatus: 'pending' })} />
            <input className="input uppercase" placeholder="IFSC" value={value.gateway.ifsc} onChange={(event) => patch('gateway', { ifsc: event.target.value.toUpperCase(), verificationStatus: 'pending_review', onboardingStatus: 'pending' })} />
            <input className="input" placeholder={value.gateway.accountLast4 ? `Account ending ${value.gateway.accountLast4}` : 'Account number'} value={value.gateway.accountNumber} onChange={(event) => patch('gateway', { accountNumber: event.target.value.replace(/\D/g, '').slice(0, 18), verificationStatus: 'pending_review', onboardingStatus: 'pending' })} />
            <button type="button" className="btn-outline sm:col-span-2" disabled={checking} onClick={verifyGateway}>
              {checking ? 'Checking onboarding…' : 'Complete gateway onboarding'}
            </button>
            {gatewayMessage && <p className="text-xs text-muted sm:col-span-2">{gatewayMessage}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
