define(
    ['cajeta'],
    function(Cajeta) {
        return describe('Test!!', function() {
            it('works for app', function() {
                expect('Hello').toEqual('Hello');
            });
        });
    }
);
