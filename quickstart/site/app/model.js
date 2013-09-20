define(['cajetaModel'], function(Cajeta) {
    var model = new Cajeta.Model.ModelCache({
        enableHistory: true,
        enableJsonDelta: true
    });

    return model;
});