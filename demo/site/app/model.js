define(['infusion.model'], function(infusion) {
    var model = new infusion.model.Model({
        enableHistory: true,
        enableJsonDelta: true
    });

    return model;
});