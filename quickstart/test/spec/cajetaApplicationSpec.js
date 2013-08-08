define(['jquery', 'cajeta', 'homePage'], function($, Cajeta, homePage) {
        // First test classes and extend functionality
        return describe('Cajeta.Application', function() {
            if (Cajeta.theApplication == null)
                Cajeta.theApplication = new Cajeta.Application({
                    id: 'demoApplication'
                });

            Cajeta.theApplication.addPage(homePage);
        });
    }
);
