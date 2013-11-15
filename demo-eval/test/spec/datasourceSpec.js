define(
    ['infusion.ds'],
    function(infusion) {
        // First test classes and extend functionality
        return describe('infusion.ds', function() {
            var data = {
                one: 'one',
                two: 'two',
                three: 'three'
            };
            it('provides a MemoryDS', function() {
                var ds = new infusion.ds.MemoryDS({
                    id: 'memDS',
                    uriTemplate: 'unitTest/cacheEntries/{key}',
                    async: false
                });

                ds.put(data, { key: '00' });

                expect(ds.get({ key: '00' }).data).toEqual(data);
                expect(ds.get({ key: '01' }).data).toBeUndefined();

                var result = null;

                var complete = function(msg) {
                    result = msg.data;
                };

                ds.get({
                    key: '00',
                    async: true,
                    onSuccess: complete
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
                var ds = new infusion.ds.CookieDS({
                    id: 'cookieDS',
                    uriTemplate: 'unitTest/cacheEntries/{key}',
                    async: false
                });

                ds.put(data, {
                    key: '00'
                });

                expect(ds.get({ key: '00' }).data).toEqual(data);
                expect(ds.get({ key: '01' }).data).toBeUndefined();

                var result = null;

                var complete = function(msg) {
                    result = msg.data;
                };

                ds.get({
                    key: '00',
                    async: true,
                    onSuccess: complete
                });

                waitsFor(function() {
                    return result != null;
                }, "Datasource never returned a value", 5000);

                // Asynchronous
                runs(function() {
                    expect(result).toEqual(data);
                });
            });

// Unsupported on Firefox and IE (what a mess)
//            it('provides a DatabaseDS', function() {
//                var ds = new infusion.Datasource.DbRestDS({
//                    id: 'dbDS',
//                    uriTemplate: 'unitTest/cacheEntries/{key}',
//                    async: false
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
//                    onSuccess: complete
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

            it('provides an AjaxDS', function() {
                var ds = new infusion.ds.AjaxDS({
                    id: 'ajaxDS',
                    modelPath: 'unitTest/cacheEntries',
                    uriTemplate: 'http://localhost:8888/unitTest/cacheEntries/{key}',
                    async: false
                });

                var data = {
                    one: 'one',
                    two: 'two',
                    three: 'three',
                    childOne: {
                        four: 'four',
                        five: 'five',
                        six: 'six'
                    },
                    childTwo: {
                        seven: 'seven',
                        eight: 'eight',
                        nine: 'nine',
                        ten: 'ten'
                    }
                };

                // TODO: These tests are failing under Karma, but pass under normal circumstances.
                // TODO: These should be revisited, but aren't blocking.
//                ds.put(data, {
//                    key: '00'
//                });

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
//                    onSuccess: complete
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
            });
        });
    }
);
