export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
};

export const getCurrentDate = (): string => {
  return new Date().toISOString();
};

export const getEasyCreatedTime = (): string => {
  return formatDate(new Date());
};
