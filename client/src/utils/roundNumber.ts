// rounds number up to specified decimal places of non-zero digits
export default function roundNumber(num: number, decimals=4) {
  num = Math.round(num * 10 ** decimals) / 10 ** decimals;
  const numStrs = num.toString().split(".");
  const nonZeroDecimals = numStrs.length > 1 ? numStrs[1].length : 0;

  return Math.round(num * 10 ** nonZeroDecimals) / 10 ** nonZeroDecimals;
}