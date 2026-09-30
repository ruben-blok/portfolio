export type EducationEntry = {
  id: string;
  programme: string;
  school?: string;
  period: string;
  current: boolean;
};

export const education: EducationEntry[] = [
  {
    id: "mbo",
    programme: "Software Development",
    school: "Techniek College Rotterdam",
    period: "2025 – heden",
    current: true,
  },
  {
    id: "havo",
    programme: "Havo",
    period: "2021 – 2025",
    current: false,
  },
];
