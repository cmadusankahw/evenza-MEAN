//model imports
const Service = require("../../model/service/service.model");
const Booking = require("../../model/service/booking.model");
const Appointment = require("../../model/service/appointment.model");
const ServiceCategories = require("../../model/service/categories.model");
const EventPlanner = require ("../../model/auth/eventPlanner.model");
const Merchant = require("../../model/auth/merchant.model");
const checkAuth = require("../../middleware/auth-check");

//dependency imports
const express = require("express");
const bodyParser = require("body-parser");
const multer = require ("multer");
const nodemailer = require("nodemailer");

//express app declaration
const service = express();


// multer setup for image upload
const MIME_TYPE_MAP = {
  'image/png' : 'png',
  'image/jpeg' : 'jpg',
  'image/jpg' : 'jpg',
  'image/gif' : 'gif'
};
const storage = multer.diskStorage({
  destination: (req, file, cb) =>{
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error= new Error("Invalid Image");
    if(isValid){
      error=null;
    }
    cb(error,"src/assets/images/services");
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + '-' + Date.now() + '.' + ext);
  }
});


//middleware
service.use(bodyParser.json());
service.use(bodyParser.urlencoded({ extended: false }));


//add new service
service.post('/add',checkAuth, (req, res, next) => {
    var lastid;
    Service.find(function (err, services) {
      if(services.length){
        lastid = services[services.length-1].service_id;
      } else {
        lastid= 'S0';
      }
      let mId = +(lastid.slice(1));
      ++mId;
      lastid = 'S' + mId.toString();
      console.log(lastid);
      if (err) return handleError(err => {
        res.status(500).json({
          message: 'Error occured while getting product ID details!'
        });
      });
    }).then( () => {
    const reqService = req.body;
    reqService['service_id']= lastid;
    reqService['user_id']= req.userData.user_id;
    const newService = new Service(reqService);
    console.log(newService);
    newService.save()
    .then(result => {
        res.status(200).json({
          message: 'service added successfully!',
          ressult: result
        });
      })
      .catch(err=>{
        res.status(500).json({
          message: 'Service creation was unsuccessfull! Please try Again!'
        });
      });
    });
});

// add service photos
service.post('/add/img',checkAuth, multer({storage:storage}).array("images[]"), (req, res, next) => {
    const url = req.protocol + '://' + req.get("host");
    let image01Path, image02Path, image03Path = null;
    if (req.files[0]){
      image01Path = url+ "/images/services/" + req.files[0].filename;
    }
    if (req.files[1]){
      image02Path = url+ "/images/services/" + req.files[1].filename;
    }
    if (req.files[2]){
      image03Path = url+ "/images/services/" + req.files[2].filename;
    }
    res.status(200).json({
      image_01: image01Path,
      image_02: image02Path,
      image_03: image03Path
    });

});

//edit service
service.post('/edit',checkAuth, (req, res, next) => {
  const newService = new Service(req.body);
  console.log(newService);
  Service.updateOne({ service_id: req.body.service_id }, {
    service_name: req.body.service_name,
    business_name:  req.body.business_name,
    description: req.body.description,
    service_category: req.body.product_category,
    available_booking: req.body.available_booking,
    available_appoints: req.body.available_appoints,
    rating: req.body.rating,
    no_of_ratings: req.body.no_of_ratings,
    no_of_bookings: req.body.no_of_bookings,
    no_of_appoints: req.body.no_of_appoints,
    created_date: req.body.created_date,
    created_time: req.body.created_time,
    rate: req.body.rate,
    rate_type: req.body.rate_type,
    pay_on_meet: req.body.pay_on_meet,
    image_01: req.body.image_01,
    image_02: req.body.image_02,
    image_03: req.body.image_03,
    user_id: req.userData.user_id
  })
  .then(result=>{
    res.status(200).json({
      message: 'service updated successfully!',
      result: result
    });
  })
  .catch(err=>{
    res.status(500).json({
      message: 'Service update was unsuccessfull! Please try Again!'
    });
  });
});


//remove a service
service.delete('/edit/:id',checkAuth, (req, res, next) => {
  Service.deleteOne({'service_id': req.params.id}).then(
    result => {
      console.log(result);
      res.status(200).json({ message: "Service  deleted!" });
    }
  ).catch(err => {
    res.status(500).json({ message: "Service was not deleted! Please try again!" });
  })
});


//search products
service.post('/search', (req, res, next) => {

  Service.find({service_category: req.body.category,
                rate: {$gte: req.body.minPrice},
                pay_on_meet:req.body.payOnMeet,
                rating: {$gte: req.body.userRating}})
  .then(result => {
      res.status(200).json({
        message: 'services recieved successfully!',
        services: result
      });
    })
    .catch(err=>{
      res.status(500).json({
        message: 'No matching services Found!'
      });
    });
});



//add new booking
service.post('/booking/add',checkAuth, (req, res, next) => {
  var lastid;
  let reqBooking = req.body;
  let serviceProviderId;
  // generate id
  Booking.find(function (err, bookings) {
    if(bookings.length){
      lastid = bookings[bookings.length-1].booking_id;
    } else {
      lastid= 'B0';
    }
    let mId = +(lastid.slice(1));
    ++mId;
    lastid = 'B' + mId.toString();
    console.log(lastid);
    reqBooking['booking_id']= lastid; // last id
    if (err) return handleError(err => {
      console.log(err);
      res.status(500).json({
        message: 'Error occured while generating booking Id! Please Retry!'
      });
    });
  }).then( () => {
    // get service provider id and incrementing no_of_bookings
    Service.findOneAndUpdate({'service_id': req.body.service_id},{$inc : {'no_of_bookings':1} },function (err, recievedService) {
      console.log(recievedService);
      serviceProviderId = recievedService.user_id; // serviceProvider id
      if (err) return handleError(err => {
        console.log(err);
        res.status(500).json({
          message: 'Error occured while creating Booking! Please Retry!'
        });
      });
  }).then( () => {
    // get customer name
    EventPlanner.findOne({'user_id': req.userData.user_id}, function (err, recievedPlanner) {
      console.log(recievedPlanner);
      reqBooking.user = {
        'user_id':req.userData.user_id,
        'email': recievedPlanner.email,
        'name': recievedPlanner.first_name + ' ' + recievedPlanner.last_name
      }
      if (err) return handleError(err => {
        console.log(err);
        res.status(500).json({
          message: 'Error occured while creating Booking! Please Retry!'
        });
      });
      }).then(()=>{
        Merchant.findOne({'user_id': serviceProviderId}, function (err, recievedMerchant){
             reqBooking.serviceProvider = {
            'serviceProvider_id':serviceProviderId,
            'email': recievedMerchant.email,
            'name': recievedMerchant.first_name + ' ' + recievedMerchant.last_name
          }
          if (err) return handleError(err => {
            console.log(err);
            res.status(500).json({
              message: 'Error occured while creating Booking! Please Retry!'
            });
          });
          const mail= {
            email:recievedMerchant.email,
            subject: "New Booking on " + req.body.service_name,
            html: createHTML('Booking',req.body)
          }
          console.log(mail);
          const newBooking = new Booking(reqBooking);
          console.log(' final booking ', newBooking);
          newBooking.save().then(result => {
            sendMail(mail, () => {});
            res.status(200).json({
                message: 'Booking created successfully!',
                bookingId: result.booking_id // booking id as result
            });
          });
         });
      }).catch (err => {
      console.log('then 2 ', err);
      res.status(500).json({
        message: 'Error occured while creating Booking! Please Retry!'
      });
    });
    }).catch (err => {
      console.log('then 2 ', err);
      res.status(500).json({
        message: 'Error occured while creating Booking! Please Retry!'
      });
    }); // then 3
 }).catch (err => {
   console.log('then 1 ', err);
   res.status(500).json({
    message: 'Error occured while creating Booking! Please Retry!'
  });
 });
});


//add new appointment
service.post('/appoint/add',checkAuth, (req, res, next) => {
  var lastid;
  let reqAppoint = req.body;
  let serviceProviderId;
  // generate id
  Appointment.find(function (err, appoints) {
    if(appoints.length){
      lastid = appoints[appoints.length-1].appoint_id;
    } else {
      lastid= 'A0';
    }
    let mId = +(lastid.slice(1));
    ++mId;
    lastid = 'A' + mId.toString();
    console.log(lastid);
    reqAppoint['appoint_id']= lastid; // last id
    if (err) return handleError(err => {
      console.log(err);
      res.status(500).json({
        message: 'Error occured while generating Appointment Id! Please Retry!'
      });
    });
  }).then( () => {
    // get service provider id and incrementing no_of_appoints
    Service.findOneAndUpdate({'service_id': req.body.service_id},{$inc : {'no_of_appoints':1} },function (err, recievedService) {
      console.log(recievedService);
      serviceProviderId = recievedService.user_id; // serviceProvider id
      if (err) return handleError(err => {
        console.log(err);
        res.status(500).json({
          message: 'Error occured while creating Appointment! Please Retry!'
        });
      });
  }).then( () => {
    // get customer name
    EventPlanner.findOne({'user_id': req.userData.user_id}, function (err, recievedPlanner) {
      console.log(recievedPlanner);
      reqAppoint.user = {
        'user_id':req.userData.user_id,
        'email': recievedPlanner.email,
        'name': recievedPlanner.first_name + ' ' + recievedPlanner.last_name
      }
      if (err) return handleError(err => {
        console.log(err);
        res.status(500).json({
          message: 'Error occured while creating Appointment! Please Retry!'
        });
      });

      }).then(() => {
        Merchant.findOne({'user_id': serviceProviderId}, function (err, recievedMerchant){
          reqAppoint.serviceProvider = {
            'serviceProvider_id':serviceProviderId,
            'email': recievedMerchant.email,
            'name': recievedMerchant.first_name + ' ' + recievedMerchant.last_name
          }
          if (err) return handleError(err => {
            console.log(err);
            res.status(500).json({
              message: 'Error occured while creating Appointment! Please Retry!'
            });
          });
          const mail= {
            email:recievedMerchant.email,
            subject: "New Appointment on " + req.body.service_name,
            html: createHTML('Appointment',req.body)
          }
          console.log(mail);
          const newAppoint = new Appointment(reqAppoint);
          console.log(' final appointment ', newAppoint);
          newAppoint.save().then(result => {
            sendMail(mail, () => {});
            res.status(200).json({
                message: 'Appointment created successfully!',
                appointId: result.appoint_id // booking id as result
            });
          });
         });
      }).catch (err => {
        console.log('then 2 ', err);
        res.status(500).json({
          message: 'Error occured while creating Appointment! Please Retry!'
        });
      });
    }).catch (err => {
      console.log('then 2 ', err);
      res.status(500).json({
        message: 'Error occured while creating Appointment! Please Retry!'
      });
    }); // then 3
 }).catch (err => {
   console.log('then 1 ', err);
   res.status(500).json({
    message: 'Error occured while creating Appointment! Please Retry!'
  });
 });
});



// get methods


//get list of services
service.get('/get', (req, res, next) => {
  Service.find(function (err, services) {
    console.log(services);
    if (err) return handleError(err => {
      res.status(500).json(
        { message: 'No matching Services Found! Please check your filters again!'}
        );
    });
    res.status(200).json(
      {
        message: 'Product list recieved successfully!',
        services: services
      }
    );
  });
});

//get list of service provider only services
service.get('/get/sp',checkAuth, (req, res, next) => {
  Service.find({ user_id: req.userData.user_id },function (err, services) {
    delete services['user_id'];
    console.log(services);
    if (err) return handleError(err => {
      res.status(500).json(
        { message: 'No matching Services Found! Please try again!'}
        );
    });
    res.status(200).json(
      {
        message: 'Product list recieved successfully!',
        services: services
      }
    );
  });
});


//get selected service
service.get('/get/:id', (req, res, next) => {

  Service.findOne({ service_id: req.params.id }, function (err,service) {
    if (err) return handleError(err => {
      res.status(500).json(
        { message: 'Error while loading service details! Please try another time!'}
        );
    });
    res.status(200).json(
      {
        message: 'Service recieved successfully!',
        service: service
      }
    );
  });
});

//get product categories
service.get('/cat', (req, res, next) => {

  ServiceCategories.find(function (err, categories) {
    console.log(categories);
    if (err) return handleError(err);
    res.status(200).json(
      {
        message: 'Product categories recieved successfully!',
        categories: categories
      }
    );
  });
});


// to be removed
//get product id of the last product
service.get('/last', (req, res, next) => {
  Service.find(function (err, services) {
    var lastid;
    if(services.length){
      lastid = services[services.length-1].service_id;
    } else {
      lastid= 'S0';
    }
    console.log(lastid);
    if (err) return handleError(err);
    res.status(200).json(
      {
        lastid: lastid
      }
    );
  });
});


// nodemailer send email function
async function sendMail(mail, callback) {

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'chiran.hw@gmail.com',
      pass: 'chim2cls2ppt'
    }
  });

  let mailOptions = {
    from: '"Evenza HelpDesk "<support@evenza.biz>', // sender address
    to: mail.email, // list of receivers
    subject: mail.subject, // Subject line
    html: mail.html
  };

  // send mail with defined transport object
  let info = await transporter.sendMail(mailOptions);

  callback(info);
}

// create custom HTML
function createHTML(mailType,content) {
  if(mailType == 'Booking'){
    const message = "<h3> You have new "+ mailType + " on " + content.service_name + "</h3><hr><h4>" + mailType + " ID : <b> " +
    content.booking_id
    + "</b></h4><h4>Booked Date : <b> " +
   content.from_date.slice(0,10)
    + " </b></h4><h4>Duration : <b> " + content.duration + ' ' + content.rate_type.slice(1) + "(s) </b></h4><hr><div class='text-center'><p><b> Please log in to view more details.<br><br><a class='btn btn-lg' href='evenza.biz//login'>Log In</a></b></p></div>"
   return message;
  } else if (mailType == 'Appointment'){
    const message = "<h3> You have new "+ mailType + " on " + content.service_name + "</h3><hr><h4>" + mailType + " ID : <b> " +
    content.appoint_id
    + "</b></h4><h4>Appointed Date : <b> " +
   content.appointed_date.slice(0,10)
    + " </b></h4><h4>Appointed Time : <b> " + content.appointed_time.hour + ':' + content.appointed_time.minute + " Hrs </b></h4><hr><div class='text-center'><p><b> Please log in to view more details.<br><br><a class='btn btn-lg' href='evenza.biz//login'>Log In</a></b></p></div>"
   return message;
  }

  }


module.exports = service;