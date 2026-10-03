// The database stores integer paise; the API talks in rupees.
export const toPaise = (rupees) => Math.round(Number(rupees) * 100);
export const fromPaise = (paise) => paise / 100;
