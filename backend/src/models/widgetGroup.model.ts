import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWidgetGroup extends Document {
  groupNumber: number;
  categories: {
    categoryId: string;
    name: string;
    image: string;
    slug: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const widgetGroupSchema = new Schema({
  groupNumber: { type: Number, required: false },
  categories: [{
    categoryId: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String, default: '' },
    slug: { type: String, required: true }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add a pre-save middleware to automatically set the group number
widgetGroupSchema.pre('save', async function(next) {
  if (this.isNew && !this.groupNumber) {
    const model = this.constructor as Model<IWidgetGroup>;
    const lastGroup = await model.findOne({}, {}, { sort: { groupNumber: -1 } });
    this.groupNumber = lastGroup ? lastGroup.groupNumber + 1 : 1;
  }
  next();
});

export const WidgetGroup = mongoose.model<IWidgetGroup>('WidgetGroup', widgetGroupSchema); 