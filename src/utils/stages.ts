const discoveryStageLabels = ["I-2", "I-3", "I-4", "II-1", "II-2", "II-4", "II-5"];

export function toRoman(value: number) {
  const romanMap: Array<[number, string]> = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let remaining = value;
  let result = "";
  for (const [num, roman] of romanMap) {
    while (remaining >= num) {
      result += roman;
      remaining -= num;
    }
  }
  return result;
}

export function getDiscoveryLabel(index: number) {
  return discoveryStageLabels[index] ?? `Slot ${index + 1}`;
}
