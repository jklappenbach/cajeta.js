define(['jquery', 'infusion', 'application'], function($, infusion, app) {
        // First test classes and extend functionality
        return describe('infusion.Application tests', function() {
            it('Expects a valid application', function() {
                expect(app).toBeDefined();
            });
        });
    }
);
