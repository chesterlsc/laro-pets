'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent, type InputHTMLAttributes } from 'react';
import { Icon } from '@/components/icons';
import { Button } from '@/components/ui';
import { track } from '@/lib/analytics';
import { useCart } from '@/lib/cart';
import { orderSchema, type PaymentMethod } from '@/lib/order-schema';
import { peso, quote } from '@/lib/pricing';

const METHODS: { id: PaymentMethod; label: string; pay: string }[] = [
  { id: 'cod', label: 'Cash on Delivery', pay: '' },
  { id: 'gcash', label: 'GCash', pay: 'GCash' },
  { id: 'maya', label: 'Maya', pay: 'Maya' },
  { id: 'card', label: 'Credit/Debit card', pay: 'card' },
];

type FieldProps = { name: string; label: string; error?: string; textarea?: boolean; className?: string } & InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>;
function Field({ name, label, error, textarea, className, ...rest }: FieldProps) {
  const id = `f-${name.replace('.', '-')}`;
  const box = `w-full rounded-inner border-2 bg-white px-4 py-3 font-body text-[16px] text-ink outline-none transition-colors focus:border-primary ${error ? 'border-cta' : 'border-border'}`;
  const a11y = { id, name, 'aria-invalid': !!error || undefined, 'aria-describedby': error ? `${id}-err` : undefined };
  return (
    <div className={`flex flex-col gap-[6px] ${className ?? ''}`}>
      <label htmlFor={id} className="text-[14px] font-extrabold">{label}</label>
      {textarea ? <textarea {...a11y} rows={2} className={box} {...(rest as InputHTMLAttributes<HTMLTextAreaElement>)} /> : <input {...a11y} className={`${box} min-h-12`} {...(rest as InputHTMLAttributes<HTMLInputElement>)} />}
      {error && <p id={`${id}-err`} className="text-[13px] font-bold text-cta">{error}</p>}
    </div>
  );
}

export function DeliveryForm() {
  const router = useRouter();
  const { cart, ready, reset } = useCart();
  const [method, setMethod] = useState<PaymentMethod>('cod');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);
  const tracked = useRef(false);
  const total = quote(cart).total;

  useEffect(() => {
    if (ready && !tracked.current) { tracked.current = true; track('begin_checkout', { value: total }); }
  }, [ready, total]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const s = (k: string) => String(f.get(k) ?? '');
    const payload = {
      tier: cart.tier, extraRefills: cart.extraRefills, prints: cart.prints,
      customer: { name: s('customer.name'), mobile: s('customer.mobile'), email: s('customer.email') },
      address: { line1: s('address.line1'), barangay: s('address.barangay'), city: s('address.city'), province: s('address.province'), zip: s('address.zip') },
      notes: s('notes'), paymentMethod: method,
    };
    const parsed = orderSchema.safeParse(payload);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const i of parsed.error.issues) next[i.path.join('.')] ??= i.message;
      setErrors(next);
      setServerError(next.prints ?? '');
      document.getElementById(`f-${Object.keys(next)[0]?.replace('.', '-')}`)?.focus();
      return;
    }
    setErrors({}); setServerError(''); setBusy(true);
    try {
      const res = await fetch(method === 'cod' ? '/api/orders' : '/api/checkout/paymongo', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? json.errors?.formErrors?.[0] ?? 'Something went wrong. Please try again.');
      if (method === 'cod') { reset(); router.push('/thank-you/' + json.orderId); }
      else window.location.assign(json.url);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setBusy(false);
    }
  }

  const pay = METHODS.find((m) => m.id === method)!;
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Field name="customer.name" label="Full name" autoComplete="name" required error={errors['customer.name']} className="md:col-span-2" />
        <Field name="customer.mobile" label="Mobile number" type="tel" inputMode="tel" autoComplete="tel" placeholder="09XX XXX XXXX" required error={errors['customer.mobile']} />
        <Field name="customer.email" label="Email (optional)" type="email" inputMode="email" autoComplete="email" error={errors['customer.email']} />
        <Field name="address.line1" label="House/unit + street" autoComplete="address-line1" required error={errors['address.line1']} className="md:col-span-2" />
        <Field name="address.barangay" label="Barangay" autoComplete="address-level3" required error={errors['address.barangay']} />
        <Field name="address.city" label="City/Municipality" autoComplete="address-level2" required error={errors['address.city']} />
        <Field name="address.province" label="Province" autoComplete="address-level1" required error={errors['address.province']} />
        <Field name="address.zip" label="ZIP" inputMode="numeric" pattern="[0-9]*" maxLength={4} autoComplete="postal-code" required error={errors['address.zip']} />
        <Field name="notes" label="Delivery notes (optional)" textarea maxLength={300} error={errors.notes} className="md:col-span-2" />
      </div>

      <fieldset className="m-0 rounded-card border-2 border-border p-5">
        <legend className="px-2 font-display text-[18px] font-bold">Payment method</legend>
        <div className="flex flex-col gap-1">
          {METHODS.map((m) => (
            <label key={m.id} className="flex min-h-11 cursor-pointer items-center gap-3 text-[16px] font-bold">
              <input type="radio" name="paymentMethod" value={m.id} checked={method === m.id} onChange={() => { setMethod(m.id); track('add_payment_info', { method: m.id }); }} className="size-5 accent-cta" />
              {m.label}
            </label>
          ))}
        </div>
        <p className="mt-3 flex items-center gap-[6px] text-[13px] text-muted"><Icon name="lock" size={16} />Secured by PayMongo</p>
      </fieldset>

      {serverError && <div role="alert" className="rounded-inner border-2 border-cta bg-tint2 px-4 py-3 text-[15px] font-bold text-cta">{serverError}</div>}

      <Button type="submit" full disabled={busy || !ready}>
        {busy ? 'Placing your order…' : method === 'cod' ? 'Place order · Cash on Delivery' : `Pay ${peso(total)} with ${pay.pay}`}
      </Button>
    </form>
  );
}
