export type SpinPreset = {
  id: string;
  nameKo: string;
  nameEn: string;
  nameFr: string;
  items: string[];
};

export const SPIN_PRESETS: SpinPreset[] = [
  {
    id: "lunch",
    nameKo: "점심 메뉴",
    nameEn: "Lunch",
    nameFr: "Déjeuner",
    items: ["한식", "중식", "일식", "양식", "분식", "패스트푸드"],
  },
  {
    id: "team",
    nameKo: "팀 빌딩",
    nameEn: "Team",
    nameFr: "Équipe",
    items: ["팀원 1", "팀원 2", "팀원 3", "팀원 4", "팀원 5", "팀원 6"],
  },
  {
    id: "coffee",
    nameKo: "카페 메뉴",
    nameEn: "Café",
    nameFr: "Café",
    items: ["아메리카노", "라떼", "카푸치노", "녹차", "주스", "코코아"],
  },
  {
    id: "custom",
    nameKo: "직접 입력",
    nameEn: "Custom",
    nameFr: "Perso",
    items: ["항목 1", "항목 2", "항목 3", "항목 4", "항목 5", "항목 6"],
  },
];
