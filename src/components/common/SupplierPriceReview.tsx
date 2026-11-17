import React from 'react';
import type { SupplierReview } from '../../types';
import { formatINR } from '../../utils/formatters';
export function SupplierPriceReview({ review }: { review: SupplierReview }) {
  const p = review.pricing;
  const rows: [string, number | null][] = [
    ['Supplier metal value', p.suppliedMetalValue], ['Net weight × supplied rate (before any purity factor)', p.calculatedMetalValue],
    ['Stone / bead value', p.stoneOrBeadValue], ['Making charges', p.makingCharges],
    ['Supplied component subtotal', p.suppliedComponentSubtotal], ['Weight-based component subtotal', p.weightBasedComponentSubtotal],
    ['Supplier selling price (unapproved)', p.suppliedSellingPrice],
    ...(p.possibleSourceIntendedPrice ? [['Possible source-intended price (unconfirmed)', p.possibleSourceIntendedPrice] as [string, number]] : []),
  ];
  return <div className="space-y-3 break-words text-xs"><p>Source figures for review only. GST basis, applicable tax and final quotation are unconfirmed.</p><dl>{rows.map(([label, value]) => <div key={label} className="flex flex-wrap justify-between gap-2 py-2 border-b border-[#E7E1D7]"><dt>{label}</dt><dd className="font-bold">{value === null ? 'Not confirmed' : formatINR(value)}</dd></div>)}</dl><ul className="list-disc pl-5">{review.issues.map((issue) => <li key={issue}>{issue}</li>)}</ul></div>;
}
