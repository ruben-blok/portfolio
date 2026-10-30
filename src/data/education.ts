export type EducationId = "mbo" | "havo";

export type EducationBase = {
  id: EducationId;
  school?: string;
  current: boolean;
};

export type EducationText = {
  programme: string;
  period: string;
};

export type EducationEntry = EducationBase & EducationText;

export const educationBase: EducationBase[] = [
  {
    id: "mbo",
    school: "Techniek College Rotterdam",
    current: true,
  },
  {
    id: "havo",
    current: false,
  },
];
