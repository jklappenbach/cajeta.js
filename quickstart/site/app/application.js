define(['jquery', 'cajetaHtml5', 'homePage'], function($, Cajeta, homePage) {
    Cajeta.theApplication = new Cajeta.Application();
    // Note:  When this is created, we can still access it globally thought Cajeta.Datasource.map
    new Cajeta.Datasource.RestAjax({
        header: {
            'Accept' : "application/json; charset=UTF-8",
            'Content-Type' : "application/x-www-form-urlencoded; charset=UTF-8"
        },
        encoding: 'application/json',
        uriTemplate: 'http://localhost:8080/application/users/{userId}',
        datasourceId: 'http://localhost:8080/application/users/',
        modelPath: 'application.user'
    });

    Cajeta.theApplication.addPage(homePage);
    return Cajeta.theApplication;
});
