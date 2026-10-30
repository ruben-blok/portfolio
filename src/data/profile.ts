export type ProfileLinkId = "email" | "github" | "linkedin" | "huggingface";

export type ProfileLinkBase = {
  id: ProfileLinkId;
  href: string;
  handle: string;
};

export type ProfileLink = ProfileLinkBase & {
  label: string;
};

export const profileBase = {
  name: "Ruben Blok",
  email: "ruben.blok36@gmail.com",
} as const;

export const profileLinkBase: ProfileLinkBase[] = [
  {
    id: "email",
    href: `mailto:${profileBase.email}`,
    handle: profileBase.email,
  },
  {
    id: "github",
    href: "https://github.com/ruben-blok",
    handle: "github.com/ruben-blok",
  },
  {
    id: "linkedin",
    href: "https://www.linkedin.com/in/ruben-blok-069597389/",
    handle: "linkedin.com/in/ruben-blok",
  },
  {
    id: "huggingface",
    href: "https://huggingface.co/ruben-blok",
    handle: "huggingface.co/ruben-blok",
  },
];
