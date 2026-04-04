/** 목록 상단 빠른 필터(태그와 동일 문자열로 매칭) */
export const TOPIC_FILTER_SLUGS = [
  "돈",
  "사업",
  "운동",
  "AI",
  "책",
  "루틴",
  "마인드셋",
  "작업환경"
] as const;

export type TopicSlug = (typeof TOPIC_FILTER_SLUGS)[number];

export const RECOMMENDED_MIN_LIKES = 15;
