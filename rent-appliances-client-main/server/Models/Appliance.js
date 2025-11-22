import mongoose from 'mongoose';

const ApplianceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    imgUrl: { type: String, default: "" },
    price: { type: Number, required: true },
    details: { type: String, required: true },
    available: { type: Boolean, default: false } 
});

const ApplianceModel = mongoose.model('Appliance', ApplianceSchema, 'Appliances');
export default ApplianceModel;
