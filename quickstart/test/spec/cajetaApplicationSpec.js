define(['jquery', 'cajeta', 'application'], function($, cajeta, app) {
        // First test classes and extend functionality
        return describe('cajeta.Application tests', function() {
            it('Expects a valid application', function() {
                expect(app).toBeDefined();
            });
        });
    }
);
