import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
    user: { type: String, required: true }, // Username
    email: { type: String, required: true },
    appliance: { type: String, required: true }, // Appliance name
    applianceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appliance' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalAmount: { type: Number, required: true },
    status: { 
        type: String, 
        enum: ['pending', 'active', 'completed', 'returned', 'cancelled'],
        default: 'pending' 
    },
    deliveryAddress: {
        area: String,
        city: String,
        street: String,
        number: String,
        zipCode: String,
        phone: String
    },
    createdAt: { type: Date, default: Date.now },
    returnedAt: { type: Date }
});

const OrderModel = mongoose.model('Order', OrderSchema, 'Orders');
export default OrderModel;

