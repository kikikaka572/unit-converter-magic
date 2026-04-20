import React, { useState } from "react";

// 2026년 기준 4대보험 근로자 부담률
const PENSION_RATE = 0.045;      // 국민연금 4.5%
const HEALTH_RATE = 0.03545;     // 건강보험 3.545%
const CARE_RATE = 0.1305;        // 장기요양보험 13.05% (건강보험료의 13.05%)
const EMPLOYMENT_RATE = 0.009;   // 고용보험 0.9%

function calcDeductions(gross: number) {
  const pension = gross * PENSION_RATE;
  const health = gross * HEALTH_RATE;
  const care = health * CARE_RATE;
  const employment = gross * EMPLOYMENT_RATE;
  const total = pension + health + care + employment;
  return { pension, health, care, employment, total };
}

// 2026년 근로소득세율 (간이, 누진공제 적용)
function calcIncomeTax(gross: number) {
  // 연간 과세표준 기준
  if (gross <= 14_000_000) return gross * 0.06;
  if (gross <= 50_000_000) return gross * 0.15 - 1_260_000;
  if (gross <= 88_000_000) return gross * 0.24 - 5_760_000;
  if (gross <= 150_000_000) return gross * 0.35 - 14_460_000;
  if (gross <= 300_000_000) return gross * 0.38 - 19_490_000;
  if (gross <= 500_000_000) return gross * 0.40 - 25_490_000;
  if (gross <= 1_000_000_000) return gross * 0.42 - 35_490_000;
  return gross * 0.45 - 69_490_000;
}

const SalaryCalculator = () => {
  const [mode, setMode] = useState<"yearToMonth" | "monthToYear">("yearToMonth");
  const [input, setInput] = useState("");
  const [result, setResult] = useState<null | {
    gross: number;
    net: number;
    deductions: ReturnType<typeof calcDeductions>;
    incomeTax: number;
  }>(null);

  const handleCalculate = () => {
    const value = parseFloat(input.replace(/,/g, ""));
    if (isNaN(value)) {
      setResult(null);
      return;
    }
    let gross = 0;
    if (mode === "yearToMonth") {
      gross = Math.round((value / 12) * 100) / 100;
    } else {
      gross = Math.round((value * 12) * 100) / 100;
    }
    const deductions = calcDeductions(gross);
    const incomeTax = calcIncomeTax(gross * 12) / 12; // 월 소득세 추정
    const net = gross - deductions.total - incomeTax;
    setResult({ gross, net, deductions, incomeTax });
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex gap-2">
        <button
          class
