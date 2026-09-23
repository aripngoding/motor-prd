export const formatRupiah = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export const formatDateID = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

export const formatDateTimeID = (dateTimeStr: string): string => {
  try {
    const [datePart, timePart] = dateTimeStr.split(' ');
    const d = new Date(datePart);
    const dateFormatted = d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    return timePart ? `${dateFormatted}, ${timePart} WIB` : dateFormatted;
  } catch {
    return dateTimeStr;
  }
};
