define(['jquery', 'cajeta', 'application'], function($, Cajeta, app) {
        // First test classes and extend functionality
        return describe('Cajeta.Application tests', function() {
            it('Expects a valid application', function() {
                expect(app).toBeDefined();
            });
        });
    }
);
