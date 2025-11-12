import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
    user: { type: String, required: true },
    email: { type: String, default: "" },
    message: { type: String, required: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    createdAt: { type: Date, default: Date.now }
});

const FeedbackModel = mongoose.model('Feedback', feedbackSchema, 'feedbacks');
export default FeedbackModel;

