/**
 * Arabic number to words converter (Tafqeet)
 * تفقيط المبالغ المالية باللغة العربية
 */

const ones: { [key: number]: string } = {
  0: 'صفر',
  1: 'واحد',
  2: 'اثنان',
  3: 'ثلاثة',
  4: 'أربعة',
  5: 'خمسة',
  6: 'ستة',
  7: 'سبعة',
  8: 'ثمانية',
  9: 'تسعة',
  10: 'عشرة',
  11: 'أحد عشر',
  12: 'اثنا عشر',
  13: 'ثلاثة عشر',
  14: 'أربعة عشر',
  15: 'خمسة عشر',
  16: 'ستة عشر',
  17: 'سبعة عشر',
  18: 'ثمانية عشر',
  19: 'تسعة عشر',
};

const tens: { [key: number]: string } = {
  2: 'عشرون',
  3: 'ثلاثون',
  4: 'أربعون',
  5: 'خمسون',
  6: 'ستون',
  7: 'سبعون',
  8: 'ثمانون',
  9: 'تسعون',
};

const hundreds: { [key: number]: string } = {
  1: 'مائة',
  2: 'مائتين',
  3: 'ثلاثمائة',
  4: 'أربعمائة',
  5: 'خمسمائة',
  6: 'ستمائة',
  7: 'سبعمائة',
  8: 'ثمانمائة',
  9: 'تسعمائة',
};

function convertLessThanThousand(num: number): string {
  if (num === 0) return '';
  
  let parts: string[] = [];
  
  const h = Math.floor(num / 100);
  const remainder = num % 100;
  
  if (h > 0) {
    parts.push(hundreds[h]);
  }
  
  if (remainder > 0) {
    if (remainder <= 19) {
      parts.push(ones[remainder]);
    } else {
      const ten = Math.floor(remainder / 10);
      const one = remainder % 10;
      if (one > 0) {
        parts.push(`${ones[one]} و${tens[ten]}`);
      } else {
        parts.push(tens[ten]);
      }
    }
  }
  
  return parts.join(' و ');
}

export function numberToArabicWords(num: number): string {
  if (num === 0) return 'صفر';
  if (num < 0) return `سالب ${numberToArabicWords(Math.abs(num))}`;

  num = Math.floor(num);
  let parts: string[] = [];

  const millions = Math.floor(num / 1000000);
  let rem = num % 1000000;
  const thousands = Math.floor(rem / 1000);
  const belowThousand = rem % 1000;

  if (millions > 0) {
    if (millions === 1) {
      parts.push('مليون');
    } else if (millions === 2) {
      parts.push('مليونان');
    } else if (millions >= 3 && millions <= 10) {
      parts.push(`${convertLessThanThousand(millions)} ملايين`);
    } else {
      parts.push(`${convertLessThanThousand(millions)} مليون`);
    }
  }

  if (thousands > 0) {
    if (thousands === 1) {
      parts.push('ألف');
    } else if (thousands === 2) {
      parts.push('ألفان');
    } else if (thousands >= 3 && thousands <= 10) {
      parts.push(`${convertLessThanThousand(thousands)} آلاف`);
    } else {
      parts.push(`${convertLessThanThousand(thousands)} ألف`);
    }
  }

  if (belowThousand > 0) {
    parts.push(convertLessThanThousand(belowThousand));
  }

  return parts.join(' و ');
}

/**
 * Returns formatted Tafqeet matching the screenshot:
 * "لكم : تسعة وستون ألف و مائتين وتسعون ريال"
 */
export function formatTafqeet(balance: number, currency = 'ريال'): string {
  if (balance === 0) {
    return `الحساب متزن : لا يوجد رصيد متبقي (${currency})`;
  }

  const prefix = balance > 0 ? 'لكم' : 'عليكم';
  const words = numberToArabicWords(Math.abs(balance));

  return `${prefix} : ${words} ${currency}`;
}

