export type HomeStat = {
  value: string;
  label: string;
  suffix: string;
};

export type HomeFeatureItem = {
  href: string;
  icon: string;
  title: string;
  desc: string;
};

export type HomeFeatureSection = {
  id?: string;
  title: string;
  items: HomeFeatureItem[];
};
