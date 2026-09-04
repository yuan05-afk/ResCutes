/** Concise Terms of use. Informed participation, not a lawyer contract. */

export type TermsPart = {
  id: string;
  title: string;
  body: string;
};

export const TERMS_OF_USE = {
  title: "Terms of use",
  gotIt: "I Agree",
  footerLink: "Terms of use",
  loginNote: "By signing in you agree to the ",
  parts: [
    {
      id: "joining",
      title: "What you are joining",
      body: "ResCutes is a coordinated animal rescue demo for citizens, rescuers, shelters, and veterinarians in the Philippines. You can report animals, manage field assignments, run shelter operations, complete medical clearance, and support adoption. This is a demo environment and is not connected to live municipal rescue services.",
    },
    {
      id: "data",
      title: "What we use",
      body: "We use your account details, role, case reports, map locations you submit, and photos you upload to power the workflow. Staff and veterinarians may review reports and medical notes needed for intake and clearance. Demo accounts use seeded data. Do not enter real personal data you are not comfortable sharing in a demo.",
    },
    {
      id: "conduct",
      title: "How you must use it",
      body: "Use ResCutes honestly. Do not submit false reports, abuse other users, or upload harmful content. Case status and maps can be incomplete or delayed. Do not treat the demo as an official emergency dispatch system. You can stop using the app anytime.",
    },
  ] as const satisfies readonly TermsPart[],
} as const;
