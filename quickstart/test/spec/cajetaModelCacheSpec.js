define(
    ['cajeta', 'jquery'],
    function(Cajeta, $) {
        // First test classes and extend functionality
        return describe('Cajeta.Model.ModelCache', function() {

            var modelCache = null;
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
                componentId: 'test',
                modelPath: 'testData.childTwo.ten',
                modelChanged: false,
                onModelChanged: function() {
                    this.modelChanged = true;
                }
            });


            it('can instantiate with no arguments', function() {
                modelCache = new Cajeta.Model.ModelCache();
                expect(modelCache).not.toBeNull();
                expect(modelCache.getStateId()).toEqual(0);
            });

            it('can set data at root node, without a component reference', function() {
                modelCache.set('testData', dataGraph);
            });

            it('can get data from a root path', function() {
                var data = modelCache.get('testData');
                expect(data).toEqual(dataGraph);
            });

            it('can get data from an arbitrary path', function() {
                var data = modelCache.get('testData.childOne');
                expect(data).toEqual({ four: 'four', five: 'five', six: 'six' });
            });

            it('can store data off an existing node', function() {
                modelCache.set('testData.childOne.subdata', subdata);
                expect(modelCache.get('testData')).toEqual(subresult);
            });

            it('throws an exception when a get request can not be mapped to a datasource', function() {
                expect(function() { var data = modelCache.get('testData', 'invalidDs'); }).toThrow();
            });

            it('returns [undefined] when a request can not be mapped to a valid entry', function() {
                expect(modelCache.get('invalid.path')).not.toBeDefined();
            });

            it('can remove data at an existing path', function() {
                modelCache.remove('testData.childOne.subdata');
                expect(modelCache.get('testData')).toEqual({
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
                expect(modelCache.get('testData')).not.toBeDefined();
            });

            it('can bind a component to an object, signaling after binding', function() {
                modelCache.bindComponent(component);
                modelCache.set('testData', dataGraph);
                expect(component.modelChanged).toBeTruthy();
            });

            it('can remove a component from binding', function() {
                component.modelChanged = false;
                modelCache.releaseComponent(component);
                modelCache.set('testData', dataGraph);
                expect(component.modelChanged).not.toBeTruthy();
            });

            it('can save a state', function() {
                expect(modelCache.saveState()).toEqual(0);
                modelCache.set('testData.childOne.subdata', subdata);
                expect(modelCache.saveState()).toEqual(1);
                modelCache.set('testData.childTwo.subdata', subdata);
                expect(modelCache.saveState()).toEqual(2);
            });

            it('can restore a state', function() {
                modelCache.loadState(0);
                expect(modelCache.get('testData')).toEqual({
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
