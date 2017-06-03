pending_busteds = db.busteds.find({status:"running"}, {created: 1, torque_id : 1, status: 1}).sort({created:-1}).toArray();
pending_relaxes = db.relaxes.find({status:"running"}, {created: 1, torque_id : 1, status: 1}).sort({created:-1}).toArray();
pending_absrels = db.absrels.find({status:"running"}, {created: 1, torque_id : 1, status: 1}).sort({created:-1}).toArray();

busted_ids = _.map(pending_busteds, function(x) {return x._id});
_.each(busted_ids, function(x) {db.busteds.update({_id:x}, {$set : {status : "aborted"}})} );

relax_ids = _.map(pending_relaxes, function(x) {return x._id});
_.each(relax_ids, function(x) {db.relaxes.update({_id:x}, {$set : {status : "aborted"}})} );

absrel_ids = _.map(pending_absrels, function(x) {return x._id});
_.each(absrel_ids, function(x) {db.absrels.update({_id:x}, {$set : {status : "aborted"}})} );

