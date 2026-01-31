import mongoose, { Schema, Document, Model } from 'mongoose';

// =============================================================================
// MongoDB schema: WidgetGroup + nested categories
// =============================================================================
// Frontend expects: { success, data: WidgetGroup[] } where each WidgetGroup has
// _id, groupNumber, widgetName, categories: [{ categoryId, name, image, mobileImage, slug }].
// Categories are embedded (not refs) so we store a snapshot; GET uses .lean() for performance.
// =============================================================================

/**
 * Nested category item inside a widget group (embedded snapshot, not a ref).
 * Matches frontend WidgetGroupCategory.
 */
export interface IWidgetGroupCategory {
  categoryId: string;
  name: string;
  image: string;
  mobileImage: string;
  slug: string;
}

export interface IWidgetGroup extends Document {
  groupNumber: number;
  widgetName: string;
  categories: IWidgetGroupCategory[];
  createdAt: Date;
  updatedAt: Date;
}

/** Subdocument schema for categories. _id: false so .lean() returns plain objects. */
const categorySubSchema = new Schema(
  {
    categoryId: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String, default: '' },
    mobileImage: { type: String, default: '' },
    slug: { type: String, required: true },
  },
  { _id: false }
);

const widgetGroupSchema = new Schema(
  {
    groupNumber: { type: Number, required: true, default: 0 },
    widgetName: { type: String, required: true, trim: true },
    categories: {
      type: [categorySubSchema],
      default: [],
      validate: {
        validator: (v: IWidgetGroupCategory[]) => v.length <= 10,
        message: 'At most 10 categories per widget group.',
      },
    },
  },
  { timestamps: true }
);

/** Index for GET list: sort by groupNumber. */
widgetGroupSchema.index({ groupNumber: 1 });

/** Auto-assign groupNumber on create if not provided. */
widgetGroupSchema.pre('save', async function (next) {
  if (this.isNew && (this.groupNumber == null || this.groupNumber === 0)) {
    const model = this.constructor as Model<IWidgetGroup>;
    const last = await model.findOne().sort({ groupNumber: -1 }).select('groupNumber').lean();
    this.groupNumber = last ? (last.groupNumber as number) + 1 : 1;
  }
  next();
});

export const WidgetGroup = mongoose.model<IWidgetGroup>('WidgetGroup', widgetGroupSchema);
