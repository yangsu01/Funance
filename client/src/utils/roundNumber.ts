export default function roundNumber(num: number, decimals: number) {
  return Math.round(num * 10 ** decimals) / 10 ** decimals;
}