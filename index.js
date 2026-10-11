const express = require('express');
const mongoose = require('mongoose');

const bcrypt = require('bcryptjs');

const User = require('./models/User');

const jwt = require('jsonwebtoken');

const Expense = require('./models/Expense');
const authMiddleware = require('./middlewares/auth.middleware');

const JWT_SECRET = 'my_super_secret_expense_key_123';


const app = express();

const PORT = 5000;

app.use(express.json());

app.use(express.static('public'));

mongoose.connect('mongodb://127.0.0.1:27017/expense_tracker')
  .then(() => {
    console.log('Connected to MongoDB successfully!');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

app.get('/', (req,res) =>{
    res.send("Expense Tracker API is running!");
})

app.post('/signup', async(req, res) => {
    try{
        const {name, email, password } = req.body;

        if(!name || !email || !password ){
            return res.status(400).json({ message: 'Name, email and password are all required.'})
        }

        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message: 'A user with this email already exists.'})
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
        });

        await newUser.save();
        
        return res.status(201).json({
            message:'User registered successfully!',
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
            },
        });
    } catch(error){
        console.error('Signup error: ', error);
        return res.status(500).json({message: "Server error. Please Try Again"});
    }
});

app.post('/login', async (req, res) => {
    try {
        const{email, password} = req.body;

        if(!email || !password){
            return res.status(400).json({message: 'Email and password both are required.'});
        }
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message: 'Invalid email or password.'});
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if(!isPasswordMatch){
            return res.status(400).json({message: 'Password is incorrect'});
        }

        const token = jwt.sign(
            {id: user._id},
            JWT_SECRET,
            {expiresIn: "1d"}
        );

        return res.status(200).json({
            message: 'Login successfully',
            token: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error){
        console.error('Login error', error);
        return res.status(500).json({message: 'Server error. Please try again.'})
    }
})

app.post('/expenses', authMiddleware, async(req, res) => {
    try{

        const{title, amount, category} = req.body;

        
        if(!title || !amount){
            return res.status(400).json({message: 'Title and Amount both are required'})
        }


        const newExpense = new Expense({
            userId: req.user.id,
            title,
            amount,
            category,
        })

        await newExpense.save();


        return res.status(201).json({
           message: 'Expense added successfully!',
           expense: newExpense,
        });
        
    } catch (error){
        console.error('Error adding expense:', error);
        return res.status(500).json({ message: 'Server error. Could not add expense.' });
    }
});

app.get('/expenses', authMiddleware, async (req, res) => {
  try {
    // Correct Mongoose query chaining:
    const expenses = await Expense.find({ userId: req.user.id }).sort({ createdAt: -1 });

    return res.status(200).json({
      count: expenses.length,
      expenses,
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return res.status(500).json({ message: 'Server error. Could not fetch expenses.' });
  }
});

app.delete('/expenses/:id', authMiddleware, async(req, res) =>{
    try{
        const expenseId = req.params.id;

        const expense = await Expense.findById(expenseId);

        if(!expense){

            return res.status(404).json({ message: 'Expense not found.'});
        }

        if(expense.userId.toString() !== req.user.id){

            return res.status(403).json({ message: 'Unauthorized. You can only delete your own expenses.'});
        }

        await Expense.findByIdAndDelete(expenseId);

        return res.status(200).json({message: 'Expense deleted successfully!'});
    } catch(error){
        console.error('Error in deleting expense', error);
        return res.status(500).json({message: 'Server error. Could not delete expense.'})
    }
})

app.put('/expenses/:id', authMiddleware, async(req, res) =>{
    try {
        const expenseId = req.params.id;
        const { title, amount, category } = req.body;

        const expense = await Expense.findById(expenseId);

        if(!expense){

            return res.status(404).json({ message: 'Expense not found.'});
        }

        if(expense.userId.toString() !== req.user.id){

            return res.status(403).json({ message: 'Unauthorized. You can only edit your own expenses.'});
        }

        if (title) expense.title = title;
        if (amount) expense.amount = amount;
        if (category) expense.category = category;

        const updatedExpense = await expense.save();

        return res.status(200).json({
        message: 'Expense updated successfully!',
        expense: updatedExpense,
        })

        } catch(error){
            console.error('Error in updating expense:', error);
            return res.status(500).json({ message: 'Server error. Could not update expense.' });
        }
})
 
//gemini's code part (haven't study pipelining yet)
// Step 19.1: Expense Summary Route (Protected)
// Calculates total spent and spending per category for the logged-in user
app.get('/expenses/summary', authMiddleware, async (req, res) => {
  try {
    // We convert req.user.id string to a Mongoose ObjectId because aggregation pipelines
    // do not automatically cast strings to ObjectIds like find() does
    const userObjectId = new mongoose.Types.ObjectId(req.user.id);

    // MongoDB Aggregation Pipeline
    const categoryStats = await Expense.aggregate([
      // Stage 1: Filter to keep only the expenses belonging to this specific user
      {
        $match: { userId: userObjectId }
      },
      // Stage 2: Group the matching expenses by category and calculate sum of amounts
      {
        $group: {
          _id: '$category',             // Group key (e.g. 'Food', 'Travel')
          totalSpent: { $sum: '$amount' }, // Adds up the amount of all items in this category
          count: { $sum: 1 }            // Counts how many expenses fall into this category
        }
      },
      // Stage 3: Sort categories by highest spent first
      {
        $sort: { totalSpent: -1 }
      }
    ]);

    // Calculate overall grand total by summing category totals
    const grandTotal = categoryStats.reduce((sum, item) => sum + item.totalSpent, 0);

    return res.status(200).json({
      grandTotal,
      categoryStats,
    });

  } catch (error) {
    console.error('Error generating summary:', error);
    return res.status(500).json({ message: 'Server error. Could not generate summary.' });
  }
});

app.listen(PORT, () =>{
    console.log(`Server started on http://localhost:${PORT}`)
});
