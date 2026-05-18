export const daysUntil = (dateString) => {
  const expDate = new Date(dateString);
  const today = new Date();
  const diffTime = expDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString();