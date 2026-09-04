import { placeholders as p } from './placeholders';

// Proposed policies — the owner removes the "[Proposed policy]" label here once confirmed.
export const guarantee = {
  title: '30-day Cat-Approved Guarantee',
  short: 'If your cat ignores it after 30 days, send it back for a full refund.',
  label: '[Proposed policy]',
  days: 30,
};
export const warranty = {
  title: '6-month motor warranty',
  short: 'Charging or motor issue? We replace the hub.',
  label: '[Proposed policy]',
  months: 6,
};

export const couriers = ['J&T Express', 'Flash Express', 'LBC'] as const;
export const paymentMethods = ['Cash on Delivery', 'GCash', 'Maya', 'Visa', 'Mastercard'] as const;

export type PolicyPage = { slug: string; title: string; description: string; sections: { heading: string; body: string[] }[] };

// Honest drafts for the Internet Transactions Act (RA 11967) and Data Privacy Act (RA 10173).
// Facts the owner has not confirmed stay as bracketed placeholders.
export const policyPages: PolicyPage[] = [
  {
    slug: 'shipping',
    title: 'Shipping & delivery',
    description: 'How and when Laro Pets ships the Laro Hunt Mat across the Philippines.',
    sections: [
      { heading: 'Where we ship', body: ['We ship nationwide from Metro Manila via J&T Express, Flash Express or LBC. Cash on Delivery is available wherever our couriers offer it (almost everywhere); GCash, Maya and cards everywhere.'] },
      { heading: 'Delivery times', body: [`Metro Manila: ${p.deliveryDaysMetroManila} days. Provinces: ${p.deliveryDaysProvinces} days. Orders placed before our daily courier pickup are packed the same day. Delivery times are estimates and can be longer during typhoons, holidays and sale periods.`] },
      { heading: 'Shipping fee', body: ['Orders of ₱899 and up ship free. Orders below ₱899 pay a flat ₱79 shipping fee, shown before you confirm your order.'] },
      { heading: 'Tracking', body: ['Your tracking number is sent by SMS to the mobile number on the order once the courier picks up the parcel.'] },
      { heading: 'Max 2 mats per order', body: ['Each order is limited to 2 Hunt Mats. Message us for multi-cat rescues and shelters.'] },
    ],
  },
  {
    slug: 'returns',
    title: 'Returns, refunds & 30-day guarantee',
    description: 'The Laro Pets Cat-Approved Guarantee, returns and the motor warranty.',
    sections: [
      { heading: `${guarantee.title} ${guarantee.label}`, body: [`${guarantee.short} Message us within ${guarantee.days} days of delivery with your order number, and we will arrange the return. Refunds are issued to your original payment method, or by GCash/bank transfer for Cash on Delivery orders, within 7 working days of receiving the item.`, 'Please keep the box and all contents (mat cover, hub, feather wands, cable). Return shipping for guarantee returns is shouldered by Laro Pets.'] },
      { heading: `${warranty.title} ${warranty.label}`, body: [`${warranty.short} The warranty covers charging and motor defects for ${warranty.months} months from delivery. It does not cover feather wands (consumables), water damage, or damage from chewing.`] },
      { heading: 'Damaged or wrong item', body: ['If your parcel arrives damaged or incorrect, send us a photo within 48 hours of delivery and we will replace it at no cost.'] },
      { heading: 'Your rights', body: ['Nothing here limits your rights under the Consumer Act of the Philippines (RA 7394) and the Internet Transactions Act (RA 11967).'] },
    ],
  },
  {
    slug: 'privacy',
    title: 'Privacy notice (RA 10173)',
    description: 'How Laro Pets collects and uses your personal data under the Data Privacy Act of 2012.',
    sections: [
      { heading: 'What we collect', body: ['To fulfil an order we collect your name, mobile number, delivery address, optional email and delivery notes. Payment card, GCash and Maya details are entered on PayMongo, our payment processor — we never see or store them.'] },
      { heading: 'Why we collect it', body: ['To pack and deliver your order, send tracking updates by SMS, send an order receipt by email if you gave one, handle returns and warranty claims, and comply with tax and record-keeping laws.'] },
      { heading: 'Who we share it with', body: ['Our couriers (J&T Express, Flash Express, LBC) receive your name, address and mobile number to deliver the parcel. PayMongo processes payments. Our hosting and email providers store order records on our behalf. We do not sell your data.'] },
      { heading: 'Analytics', body: ['We may use Google Analytics, Meta Pixel and TikTok Pixel to understand how people use the site and to measure ads. You can block these with your browser settings.'] },
      { heading: 'Retention and your rights', body: ['Order records are kept for as long as tax law requires. Under RA 10173 you may access, correct or ask us to delete your personal data, and you may complain to the National Privacy Commission.', `Contact our data protection contact at ${p.contactEmail}.`] },
    ],
  },
  {
    slug: 'terms',
    title: 'Terms of sale',
    description: 'Terms that apply when you buy from Laro Pets.',
    sections: [
      { heading: 'Who we are', body: [`Laro Pets is operated by ${p.businessName}, ${p.businessAddress}. DTI Reg. No. ${p.dtiRegNo} · BIR TIN ${p.birTin}. Contact: ${p.contactEmail}.`] },
      { heading: 'Prices and payment', body: ['All prices are in Philippine pesos and include VAT where applicable. We accept Cash on Delivery, GCash, Maya, Visa and Mastercard. Online payments are processed by PayMongo. Cash on Delivery orders are confirmed by SMS before dispatch; repeated refused COD parcels may lead us to require prepayment.'] },
      { heading: 'Orders', body: ['An order is accepted when we send your order number. We may cancel an order if an item is out of stock, the address cannot be served by our couriers, or we suspect fraud — you will be refunded in full.'] },
      { heading: 'Delivery, returns and warranty', body: ['See our Shipping & delivery and Returns pages, which form part of these terms.'] },
      { heading: 'Safe use', body: ['The Laro Hunt Mat is a supervised-play toy for cats and kittens. Keep it away from small children and do not leave feather wands with a cat unattended.'] },
      { heading: 'Law', body: ['These terms are governed by the laws of the Republic of the Philippines, including the Consumer Act (RA 7394), the Internet Transactions Act (RA 11967) and the Data Privacy Act (RA 10173).'] },
    ],
  },
];
