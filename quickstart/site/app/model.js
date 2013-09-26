define(['cajetaModel'], function(cajeta) {
    var model = new cajeta.model.Model({
        enableHistory: true,
        enableJsonDelta: true
    });

    return model;
});