export type TutorServiceMode = "bookable" | "faculty_support" | "enquiry_only";

type TutorServiceFacts = {
  displayName?: string | null;
  availableSlotCount?: number | null;
};

export function tutorServiceMode({
  displayName,
  availableSlotCount,
}: TutorServiceFacts): TutorServiceMode {
  if (Number(availableSlotCount || 0) > 0) return "bookable";
  if (/\bfaculty\b/i.test(String(displayName || ""))) return "faculty_support";
  return "enquiry_only";
}

export function tutorServiceLabel(mode: TutorServiceMode) {
  if (mode === "bookable") return "BOOKABLE NOW";
  if (mode === "faculty_support") return "COURSE FACULTY SUPPORT";
  return "ENQUIRY ONLY";
}
