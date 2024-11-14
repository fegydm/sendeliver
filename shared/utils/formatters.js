// shared/utils/formatters.ts
export const formatPrice = (amount, currency = "EUR") => {
    return new Intl.NumberFormat("sk-SK", {
        style: "currency",
        currency,
    }).format(amount);
};
export const formatWeight = (weight) => {
    return weight >= 1000 ? `${(weight / 1000).toFixed(1)}t` : `${weight}kg`;
};
export const formatDate = (date) => {
    return new Intl.DateTimeFormat("sk-SK", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(date));
};
