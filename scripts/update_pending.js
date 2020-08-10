before_48_hours = new Date(
  new Date().getTime() - 60 * 60 * 48 * 1000
).toISOString();

pending_absrels = db.absrels
  .find(
    { status: "running", created: { $lte: before_48_hours } },
    { created: 1, torque_id: 1, status: 1 }
  )
  .toArray();
pending_busteds = db.busteds
  .find(
    { status: "running", created: { $lte: before_48_hours } },
    { created: 1, torque_id: 1, status: 1 }
  )
  .toArray();
pending_relaxes = db.relaxes
  .find(
    { status: "running", created: { $lte: before_48_hours } },
    { created: 1, torque_id: 1, status: 1 }
  )
  .toArray();
pending_fels = db.fels
  .find(
    { status: "running", created: { $lte: before_48_hours } },
    { created: 1, torque_id: 1, status: 1 }
  )
  .toArray();
pending_fubars = db.fubars
  .find(
    { status: "running", created: { $lte: before_48_hours } },
    { created: 1, torque_id: 1, status: 1 }
  )
  .toArray();
pending_gards = db.gards
  .find(
    { status: "running", created: { $lte: before_48_hours } },
    { created: 1, torque_id: 1, status: 1 }
  )
  .toArray();
pending_memes = db.memes
  .find(
    { status: "running", created: { $lte: before_48_hours } },
    { created: 1, torque_id: 1, status: 1 }
  )
  .toArray();
pending_slacs = db.slacs
  .find(
    { status: "running", created: { $lte: before_48_hours } },
    { created: 1, torque_id: 1, status: 1 }
  )
  .toArray();

printjson(pending_absrels);
printjson(pending_busteds);
printjson(pending_relaxes);
printjson(pending_fels);
printjson(pending_fubars);
printjson(pending_gards);
printjson(pending_memes);
printjson(pending_slacs);

fel_ids = _.map(pending_fels, function (x) {
  return x._id;
});
_.each(fel_ids, function (x) {
  db.fels.update({ _id: x }, { $set: { status: "aborted" } });
});

fubar_ids = _.map(pending_fubars, function (x) {
  return x._id;
});
_.each(fubar_ids, function (x) {
  db.fubars.update({ _id: x }, { $set: { status: "aborted" } });
});

gard_ids = _.map(pending_gards, function (x) {
  return x._id;
});
_.each(gard_ids, function (x) {
  db.gards.update({ _id: x }, { $set: { status: "aborted" } });
});

meme_ids = _.map(pending_memes, function (x) {
  return x._id;
});
_.each(meme_ids, function (x) {
  db.memes.update({ _id: x }, { $set: { status: "aborted" } });
});

slac_ids = _.map(pending_slacs, function (x) {
  return x._id;
});
_.each(slac_ids, function (x) {
  db.slacs.update({ _id: x }, { $set: { status: "aborted" } });
});

busted_ids = _.map(pending_busteds, function (x) {
  return x._id;
});
_.each(busted_ids, function (x) {
  db.busteds.update({ _id: x }, { $set: { status: "aborted" } });
});

relax_ids = _.map(pending_relaxes, function (x) {
  return x._id;
});
_.each(relax_ids, function (x) {
  db.relaxes.update({ _id: x }, { $set: { status: "aborted" } });
});

absrel_ids = _.map(pending_absrels, function (x) {
  return x._id;
});
_.each(absrel_ids, function (x) {
  db.absrels.update({ _id: x }, { $set: { status: "aborted" } });
});
