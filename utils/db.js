const mongoose= require('mongoose');
module.exports = connection = async () => {
    try {
      await mongoose.connect(process.env.MongoURL);
      console.log("✅DB Connection Succesfull..!");
    } catch (error) {
      console.log("❌DB Connection Failed..!");
      console.log(error);
    }
  };