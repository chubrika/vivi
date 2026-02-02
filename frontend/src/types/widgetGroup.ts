export interface WidgetGroupCategory {
  categoryId: string;
  name: string;
  image: string;
  mobileImage: string;
  slug: string;
}

export interface WidgetGroup {
  _id: string;
  groupNumber: number;
  widgetName: string;
  categories: WidgetGroupCategory[];
}
