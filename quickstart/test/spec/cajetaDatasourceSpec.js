define(
    ['cajeta'],
    function(Cajeta) {
        // First test classes and extend functionality
        return describe('Cajeta.Datasource', function() {
            var data = {
                one: 'one',
                two: 'two',
                three: 'three'
            };
            it('provides a MemoryDS', function() {
                var ds = new Cajeta.Datasource.MemoryDS({
                    id: 'memDS',
                    uriTemplate: 'test/{key}'
                });

                ds.put(data, { key: '00' });

                expect(ds.get({ key: '00' })).toEqual(data);
                expect(ds.get({ key: '01' })).toBeUndefined();

                var result = null;

                var complete = function(data, requestId) {
                    result = data;
                };

                ds.get({
                    key: '00',
                    async: true,
                    onComplete: complete
                });

                waitsFor(function() {
                    return result != null;
                }, "Datasource never returned a value", 5000);

                // Asynchronous
                runs(function() {
                    expect(result).toEqual(data);
                });
            });
            it('provides a CookieDS', function() {
                var ds = new Cajeta.Datasource.CookieDS({
                    id: 'cookieDS',
                    uriTemplate: 'test/{key}'
                });

                ds.put(data, {
                    key: '00'
                });

                expect(ds.get({ key: '00' })).toEqual(data);
                expect(ds.get({ key: '01' })).toBeUndefined();

                var result = null;

                var complete = function(data, requestId) {
                    result = data;
                };

                ds.get({
                    key: '00',
                    async: true,
                    onComplete: complete
                });

                waitsFor(function() {
                    return result != null;
                }, "Datasource never returned a value", 5000);

                // Asynchronous
                runs(function() {
                    expect(result).toEqual(data);
                });
            });
//            it('provides an AjaxDS', function() {
//                var ds = new Cajeta.Datasource.AjaxDS({
//                    id: 'cookieDS',
//                    uriTemplate: 'test/{key}'
//                });
//
//                ds.put(data, {
//                    key: '00'
//                });
//
//                expect(ds.get({ key: '00' })).toEqual(data);
//                expect(ds.get({ key: '01' })).toBeUndefined();
//
//                var result = null;
//
//                var complete = function(data, requestId) {
//                    result = data;
//                };
//
//                ds.get({
//                    key: '00',
//                    async: true,
//                    onComplete: complete
//                });
//
//                waitsFor(function() {
//                    return result != null;
//                }, "Datasource never returned a value", 5000);
//
//                // Asynchronous
//                runs(function() {
//                    expect(result).toEqual(data);
//                });
//            });
        });
    }
);
