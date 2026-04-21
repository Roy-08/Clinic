import type { TestItem } from "./types";

export const DEFAULT_TESTS: TestItem[] = [
  {
    id: "T001",
    name: "Complete Blood Count (CBC)",
    category: "Hematology",
    description:
      "Measures levels of red cells, white cells, platelets and hemoglobin to assess overall health.",
    price: 299,
    duration: "24h",
  },
  {
    id: "T002",
    name: "Lipid Profile",
    category: "Cardiology",
    description:
      "Evaluates cholesterol levels (HDL, LDL, triglycerides) to assess heart disease risk.",
    price: 499,
    duration: "24h",
  },
  {
    id: "T003",
    name: "Blood Sugar (Fasting)",
    category: "Diabetes",
    description:
      "Measures blood glucose after an 8-hour fast to screen for diabetes and prediabetes.",
    price: 149,
    duration: "6h",
  },
  {
    id: "T004",
    name: "HbA1c",
    category: "Diabetes",
    description:
      "Average blood sugar level over the past 3 months. Gold standard for diabetes monitoring.",
    price: 399,
    duration: "24h",
  },
  {
    id: "T005",
    name: "Thyroid Profile (T3, T4, TSH)",
    category: "Endocrinology",
    description:
      "Assesses thyroid gland function to detect hypo/hyperthyroidism.",
    price: 599,
    duration: "24h",
  },
  {
    id: "T006",
    name: "Liver Function Test (LFT)",
    category: "Hepatology",
    description:
      "Evaluates liver health via enzymes, proteins and bilirubin levels.",
    price: 499,
    duration: "24h",
  },
  {
    id: "T007",
    name: "Kidney Function Test (KFT)",
    category: "Nephrology",
    description:
      "Measures creatinine, urea, uric acid and electrolytes to assess kidney function.",
    price: 549,
    duration: "24h",
  },
  {
    id: "T008",
    name: "Vitamin D (25-OH)",
    category: "Nutrition",
    description:
      "Measures Vitamin D levels. Deficiency linked to bone and immune issues.",
    price: 799,
    duration: "48h",
  },
  {
    id: "T009",
    name: "Vitamin B12",
    category: "Nutrition",
    description:
      "Essential for nerve function and red blood cell formation.",
    price: 649,
    duration: "48h",
  },
  {
    id: "T010",
    name: "COVID-19 RT-PCR",
    category: "Infectious Disease",
    description:
      "Detects active SARS-CoV-2 infection via nasal swab sample.",
    price: 899,
    duration: "12h",
  },
  {
    id: "T011",
    name: "Urine Routine",
    category: "Pathology",
    description:
      "General screening for UTI, kidney issues and metabolic disorders.",
    price: 199,
    duration: "6h",
  },
  {
    id: "T012",
    name: "ECG (Electrocardiogram)",
    category: "Cardiology",
    description:
      "Records electrical activity of the heart to detect arrhythmias.",
    price: 349,
    duration: "2h",
  },
  {
    id: "T013",
    name: "Chest X-Ray",
    category: "Radiology",
    description:
      "Imaging of chest, heart and lungs to detect infections or abnormalities.",
    price: 449,
    duration: "4h",
  },
  {
    id: "T014",
    name: "Full Body Checkup",
    category: "Health Package",
    description:
      "Comprehensive 60+ parameter health screening including CBC, LFT, KFT, Lipid, Sugar.",
    price: 1999,
    duration: "48h",
  },
];