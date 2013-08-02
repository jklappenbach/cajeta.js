define(
    ['cajeta', 'jquery'],
    function(Cajeta, $) {
        // First test classes and extend functionality
        return describe('Cajeta.Model.ModelCache', function() {
            if (Cajeta.theApplication == null)
                Cajeta.theApplication = new Cajeta.Application();

            var modelCache = Cajeta.theApplication.model;
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

            var component = new Cajeta.View.Component({
                componentId: 'test3',
                modelPath: 'graphData.childTwo.ten',
                modelChanged: false,
                setModelValue: function() {
                    this.modelChanged = true;
                }
            });

            it('is instantiated by the application with functional defaults', function() {
                expect(modelCache).not.toBeNull();
                expect(modelCache.getStateId()).toEqual(0);
            });

            it('can set data at root node, without a component reference', function() {
                Cajeta.theApplication.model.set('dataGraph', dataGraph);
            });

            it('can get data from a root path', function() {
                var data = Cajeta.theApplication.model.get('dataGraph');
                expect(data).toEqual(dataGraph);
            });

            it('can get data from an arbitrary path', function() {
                var data = Cajeta.theApplication.model.get('dataGraph.childOne');
                expect(data).toEqual({ four: 'four', five: 'five', six: 'six' });
            });

            it('can store data off an existing node', function() {
                modelCache.set('dataGraph.childOne.subdata', subdata);
                expect(modelCache.get('dataGraph')).toEqual(subresult);
            });

            it('throws an exception when a get request can not be mapped to a datasource', function() {
                expect(function() { var data = modelCache.get('dataGraph', 'invalidDs'); }).toThrow();
            });

            it('returns [undefined] when a request can not be mapped to a valid entry', function() {
                expect(function() { modelCache.get('invalid.path') }).toThrow();
            });

            it('can remove data at an existing path', function() {
                //alert(JSON.stringify(modelCache.get('dataGraph')));
                modelCache.remove('dataGraph.childOne.subdata');
                //alert(JSON.stringify(modelCache.get('dataGraph')));
                expect(modelCache.get('dataGraph')).toEqual({
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
                modelCache.clearAll();
                expect(function() { modelCache.get('dataGraph') }).toThrow();
            });

            // TODO: convert this to listeners
            it('can add a component as a listener to a model path', function() {
                modelCache.addListener(component, Cajeta.Events.EVENT_MODELCACHE_CHANGED,
                        component.modelAdaptor.getEventKey());
                modelCache.set('graphData.childTwo.ten', 'ten');
                expect(component.modelChanged).toBeTruthy();
            });

            it('can remove a component from binding', function() {
                component.modelChanged = false;
                modelCache.removeListener(component, Cajeta.Events.EVENT_MODELCACHE_CHANGED,
                    component.modelAdaptor.getEventKey());
                modelCache.set('graphData.childTwo.ten', 'ten');
                expect(component.modelChanged).toBeFalsy();
            });

            it('can save a state', function() {
                modelCache.set('dataGraph', dataGraph);
                expect(modelCache.saveState()).toEqual(0);
                modelCache.set('dataGraph.childOne.subdata', subdata);
                expect(modelCache.saveState()).toEqual(1);
                modelCache.set('dataGraph.childTwo.subdata', subdata);
                expect(modelCache.saveState()).toEqual(2);
            });

            it('can restore a state', function() {
                modelCache.loadState(0);
                expect(modelCache.get('dataGraph')).toEqual({
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

            it('can correctly resume state ID progression after a restore', function() {
                modelCache.set('testData.childOne.subdata', subdata);
                expect(modelCache.saveState()).toEqual(3);
            });
        });
    }
);
