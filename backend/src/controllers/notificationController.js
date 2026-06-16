const Notification = require("../models/Notification");


// GET ALL NOTIFICATIONS

exports.getNotifications = async(req,res)=>{

try{

const notifications = await Notification.find({

    user:req.user.id

}).sort({

    createdAt:-1

});

res.json({

    count:notifications.length,

    notifications

});

}
catch(error){

res.status(500).json({

    message:error.message

});

}

};




// MARK NOTIFICATION AS READ

exports.markAsRead = async(req,res)=>{

try{

const notification = await Notification.findByIdAndUpdate(

    req.params.id,

    {
        isRead:true
    },

    {
        new:true
    }

);

res.json({

    message:"Notification Read",

    notification

});

}
catch(error){

res.status(500).json({

    message:error.message

});

}

};