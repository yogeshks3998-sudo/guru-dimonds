export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatDateOnly(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Kolkata',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function generateSKU(category: string, metal: string, id: string): string {
  const prefix = category.substring(0, 3).toUpperCase();
  const metalPrefix = metal.substring(0, 2).toUpperCase();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `VED-${prefix}-${metalPrefix}-${randomSuffix}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
