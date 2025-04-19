import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/User';

// Load environment variables
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: path.resolve(__dirname, `../../${envFile}`) });

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vivi';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Reset passwords for all users
async function resetPasswords() {
  try {
    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users`);

    // Reset each user's password to a temporary value
    for (const user of users) {
      // Set a temporary password that users can change later
      const tempPassword = 'TempPass123!';
      user.password = tempPassword;
      
      // Save the user - this will trigger the pre-save middleware to hash the password
      await user.save();
      
      console.log(`Reset password for user: ${user.email}`);
    }

    console.log('Password reset complete');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting passwords:', error);
    process.exit(1);
  }
}

// Run the script
resetPasswords(); 