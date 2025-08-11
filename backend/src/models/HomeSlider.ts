import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHomeSlider extends Document {
  name: string;
  slug?: string;
  desktopImage: string;
  mobileImage: string;
  categorySlug?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const homeSliderSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: false },
  desktopImage: { type: String, required: true },
  mobileImage: { type: String, required: true },
  categorySlug: { type: String, required: false },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add a pre-save middleware to automatically set the order
homeSliderSchema.pre('save', async function(next) {
  if (this.isNew && !this.order) {
    const model = this.constructor as Model<IHomeSlider>;
    const lastSlider = await model.findOne({}, {}, { sort: { order: -1 } });
    this.order = lastSlider ? lastSlider.order + 1 : 1;
  }
  next();
});

export const HomeSlider = mongoose.model<IHomeSlider>('HomeSlider', homeSliderSchema); 