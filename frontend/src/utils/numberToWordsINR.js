/**
 * Converts a numeric currency amount into formal Indian numbering words format
 * (e.g. 1,18,000 -> "Indian Rupees One Lakh Eighteen Thousand Only")
 * Strictly compliant with Indian GST Tax Invoice conventions (CGST Rule 46).
 */
export function numberToWordsINR(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '';
  const num = Math.floor(Math.abs(Number(amount)));
  const decimal = Math.round((Math.abs(Number(amount)) - num) * 100);
  if (num === 0 && decimal === 0) return 'Indian Rupees Zero Only';

  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertTwoDigits(n) {
    if (n < 20) return ones[n];
    return (tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '')).trim();
  }

  function convertThreeDigits(n) {
    let str = '';
    if (Math.floor(n / 100) > 0) {
      str += ones[Math.floor(n / 100)] + ' Hundred';
    }
    const rem = n % 100;
    if (rem > 0) {
      str += (str ? ' and ' : '') + convertTwoDigits(rem);
    }
    return str.trim();
  }

  let words = '';
  const crore = Math.floor(num / 10000000);
  let rem = num % 10000000;
  const lakh = Math.floor(rem / 100000);
  rem = rem % 100000;
  const thousand = Math.floor(rem / 1000);
  rem = rem % 1000;

  if (crore > 0) words += convertThreeDigits(crore) + ' Crore ';
  if (lakh > 0) words += convertTwoDigits(lakh) + ' Lakh ';
  if (thousand > 0) words += convertTwoDigits(thousand) + ' Thousand ';
  if (rem > 0) words += convertThreeDigits(rem) + ' ';

  words = words.trim();
  let result = 'Indian Rupees ' + (words || 'Zero');
  if (decimal > 0) {
    result += ' and ' + convertTwoDigits(decimal) + ' Paise';
  }
  return result + ' Only';
}
