// The API always stores and returns weights in kg. These helpers convert at the edges:
// kg -> display unit when showing a number, display unit -> kg when sending one.
const KG_PER_LB = 0.45359237;

const roundTo1 = (n) => Math.round(n * 10) / 10;

export function makeUnitHelpers(unit) {
  const isLb = unit === 'lb';

  // kg from the API -> number in the display unit (rounded to 0.1)
  const fromKg = (kg) => (kg == null || kg === '' ? kg : roundTo1(isLb ? kg / KG_PER_LB : kg));

  // Value typed by the user in the display unit -> kg for the API
  const toKg = (value) => {
    const n = parseFloat(value);
    return Number.isNaN(n) ? null : isLb ? n * KG_PER_LB : n;
  };

  return {
    unit,
    label: isLb ? 'lb' : 'kg',
    fromKg,
    toKg,
    // e.g. format(1245) -> "1,245 kg" / "2,744.8 lb"
    format: (kg) => `${(fromKg(kg) ?? 0).toLocaleString()} ${isLb ? 'lb' : 'kg'}`,
    // Whole numbers, for totals where decimals are noise: formatTotal(1223.5) -> "1,224 kg"
    formatTotal: (kg) => `${Math.round(fromKg(kg) ?? 0).toLocaleString()} ${isLb ? 'lb' : 'kg'}`,
    // Sensible defaults and input step for the workout form
    defaultWorkWeight: isLb ? 175 : 80,
    inputStep: isLb ? 1 : 0.5,
  };
}
