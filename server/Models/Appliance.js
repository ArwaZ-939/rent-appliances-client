import mongoose from 'mongoose';

const ApplianceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    name_ar: { type: String, default: "" }, // Arabic name
    imgUrl: { type: String, default: "" },
    price: { type: Number, required: true },
    details: { type: String, required: true },
    details_ar: { type: String, default: "" }, // Arabic details
    available: { type: Boolean, default: false } 
});

const ApplianceModel = mongoose.model('Appliance', ApplianceSchema, 'Appliances');
export default ApplianceModel;
