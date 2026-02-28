export const priceToEuro = (price: number) => {
  const base = 1.95583

  return (price / base).toFixed(2)
}
