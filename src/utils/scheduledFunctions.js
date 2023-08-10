const Orders = require("../model/order.model");


module.exports = {
  ACTIVATE_BOOKED_ORDER: async () => {
    try {
      const date = new Date();

      const orders = await Orders.findAll({where: { status: "BOOKED"}})

      await Promise.all(orders.map( async order => {
        if(date >= order.dataValues.end_date ){
          await Orders.update({
            status: "ACTIVE",
            seller_id: null,
            end_date: null
          },{where: { 
            id: order.dataValues.id
          }
        })
        console.log(`An order matching this id: ${order.dataValues.id} has been activated`);
        }
      }))
    } catch (error) {
      console.log(error);
    }
  }
}








// var CronJob = require('cron').CronJob;
// var job = new CronJob(
//     '* * * * * *',
//     function() {
//         console.log('You will see this message every second');
//     },
//     null,
//     true,
//     'Asia/Tashkent'
// );



// const CronJob = require("node-cron");

// module.exports = {
//   initScheduledJobs: () => {
//     const scheduledJobFunction = CronJob.schedule("* * * * *", () => {
//       console.log("I'm executed on a schedule!");
//       // Add your custom logic here
//     });
  
//     scheduledJobFunction.start();
//   }
// }




///index.js
// const express = require("express");
// // DEFINE the path to your scheduled function(s)
// const scheduledFunctions = require('./scheduledFunctions');
// const app = express();
// app.set("port", process.env.PORT || 3000);

// ADD CALL to execute your function(s)
// scheduledFunctions.initScheduledJobs();

// app.listen(app.get("port"), () => {
//   console.log("Express server listening on port " + app.get("port"));