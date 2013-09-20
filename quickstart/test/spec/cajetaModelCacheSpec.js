define(
    ['jquery', 'cajeta', 'application', 'model'],
    function(Cajeta, $, app, model) {
        // First test classes and extend functionality
        return describe('Cajeta.Model.ModelCache', function() {
            var dataGraph = {
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

            var subdata = {
                eleven: 'eleven',
                twelve: 'twelve',
                thirteen: 'thirteen'
            };

            var subresult = {
                one: 'one',
                two: 'two',
                three: 'three',
                childOne: {
                    four: 'four',
                    five: 'five',
                    six: 'six',
                    subdata: {
                        eleven: 'eleven',
                        twelve: 'twelve',
                        thirteen: 'thirteen'
                    }
                },
                childTwo: {
                    seven: 'seven',
                    eight: 'eight',
                    nine: 'nine',
                    ten: 'ten'
                }
            };

            it('is instantiated by the application with functional defaults', function() {
                expect(model).toBeDefined();
                expect(model.getStateId()).toEqual(0);
            });

            it('can set data at root node, without a component reference', function() {
                model.set('dataGraph', dataGraph);
            });

            it('can get data from a root path', function() {
                var data = model.get('dataGraph');
                expect(data).toEqual(dataGraph);
            });

            it('can get data from an arbitrary path', function() {
                var data = model.get('dataGraph.childOne');
                expect(data).toEqual({ four: 'four', five: 'five', six: 'six' });
            });

            it('can store data off an existing node', function() {
                model.set('dataGraph.childOne.subdata', subdata);
                expect(model.get('dataGraph')).toEqual(subresult);
            });

            it('returns [undefined] when a request can not be mapped to a valid entry', function() {
                expect(model.get('invalid.path')).toEqual(undefined);
            });

            it('can remove data at an existing path', function() {
                //alert(JSON.stringify(modelCache.get('dataGraph')));
                model.remove('dataGraph.childOne.subdata');
                //alert(JSON.stringify(modelCache.get('dataGraph')));
                expect(model.get('dataGraph')).toEqual({
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
                });
            });

            it('can clear all data', function() {
                model.clearAll();
                expect(model.get('dataGraph')).toEqual(undefined);
            });

            it('can save and restore state', function() {
                model.set('dataGraph', dataGraph);
                var stateId = model.saveState();
                model.loadState(stateId);
                expect(model.get('dataGraph')).toEqual(dataGraph);
            });

//            it('can correctly resume state ID progression after a restore', function() {
//                modelCache.set('testData.childOne.subdata', subdata);
//                expect(modelCache.saveState()).toEqual(3);
//            });
        });
    }
);
