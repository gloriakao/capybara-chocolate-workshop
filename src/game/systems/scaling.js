export const CORRECT_RATIO_FORMULA = "target-over-original";

export function scaleFactor(template) {
  return template.targetLength / template.originalSides[template.targetIndex];
}

export function scaledSides(template, factor = scaleFactor(template)) {
  return template.originalSides.map((side) => side * factor);
}

function closeEnough(actual, expected) {
  return Number.isFinite(actual) && Math.abs(actual - expected) < 0.001;
}

export function assessSubmission(template, values, formula) {
  const expectedFactor = scaleFactor(template);
  const expectedSides = scaledSides(template, expectedFactor);
  const enteredFactor = Number(values.k);
  const enteredSides = template.originalSides.map((_, index) => Number(values[`side_${index}`]));
  const formulaCorrect = formula === CORRECT_RATIO_FORMULA;
  const factorCorrect = closeEnough(enteredFactor, expectedFactor);
  const sidesCorrect = enteredSides.length === expectedSides.length
    && enteredSides.every((value, index) => closeEnough(value, expectedSides[index]));

  return {
    formulaCorrect,
    factorCorrect,
    sidesCorrect,
    allCorrect: formulaCorrect && factorCorrect && sidesCorrect,
    expectedFactor,
    expectedSides,
  };
}
