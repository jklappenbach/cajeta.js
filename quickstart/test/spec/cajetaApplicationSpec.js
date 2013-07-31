define(['jquery', 'cajetaHtml5', 'homePage'], function($, Cajeta, homePage) {
        // First test classes and extend functionality
        return describe('Cajeta.Application', function() {
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
        });
    }
);
