export const sanitise = (text: string) => {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "") 
    .replace(/```$/i, "") 
    .trim();
};
