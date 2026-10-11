const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title:{
        type: String,
        required: true,
        trim: true,
    },
    amount: {
        type: Number,
        required: true,
        min: [1, 'Amount must be at least 1'],
    },
    category: {
        type: String,
        required: true,
        enum: ['Food', 'Rent', 'Travel', 'Shopping', 'Bills', 'Other'],
        default: 'Other',
    },
},
{
    timestamps: true,
}
)

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;