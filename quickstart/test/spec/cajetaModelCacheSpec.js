define(
    ['cajeta', 'jquery'],
    function(Cajeta, $) {
        // First test classes and extend functionality
        return describe('Cajeta StateCache', function() {

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

            it('instantiates with no arguments', function() {
                modelCache = new Cajeta.Model.ModelCache();
                expect(modelCache).not.toBeNull();
                expect(modelCache.getStateId()).toEqual(0);
            });

            it('sets data at root node, without a component reference', function() {
                modelCache.set('testData', dataGraph);

            });

            it('gets data from a path', function() {
                var data = modelCache.get('testData');
                expect(data).toEqual(dataGraph);
            });
/*
            it('stores another state entry and increments the state ID', function() {
                modelCache.add(data01);
                expect(data00).not.toEqual(data01);
                expect(modelCache.getStateId()).toEqual(1);
                expect(modelCache.modelJson).toEqual(JSON.stringify(data01));
            });

            it('retrieves state entries', function() {
                var data = modelCache.load(0);
                expect(data).toEqual(data00);
                var data = modelCache.load(1);
                expect(data).toEqual(data01);
            });

            it('stores many entries', function() {
                var data = {
                    one: 'one'
                };

                data.two = 'two';
                modelCache.add(data);
                data.three = 'three';
                modelCache.add(data);
                data.four = 'four';
                modelCache.add(data);
                data.five = 'five';
                modelCache.add(data);
                data.six= 'six';
                modelCache.add(data);
                data.seven = 'seven';
                modelCache.add(data);
                data.eight = 'eight';
                modelCache.add(data);
                data.nine = 'nine';
                modelCache.add(data);
                data.ten = 'ten';
                modelCache.add(data);
                data.eleven = 'eleven';
                modelCache.add(data);
                data.twelve = 'twelve';
                modelCache.add(data);
                data.thirteen = 'thirteen';
                modelCache.add(data);
                data.fourteen = 'fourteen';
                modelCache.add(data);
                data.fifteen = 'fifteen';
                modelCache.add(data);
                data.sixteen = 'sixteen';
                modelCache.add(data);
                data.seventeen = 'seventeen';
                modelCache.add(data);
                data.eighteen = 'eighteen';
                modelCache.add(data);

                expect(modelCache.stateId).toEqual(18);
            });

            it('stores uncompressed key entries defined by modulus of the index', function() {
                var stateId = 10;
                expect(JSON.parse(modelCache.cache[10])).toEqual(data10);
            });

            it('can restore an arbitrary, non-key entry', function() {
                expect(modelCache.load(5)).toEqual(data05);
                expect(modelCache.load(15)).toEqual(data15);
            });

            it('can restore an arbitrary, key entry', function() {
                expect(modelCache.load(10)).toEqual(data10);
                expect(modelCache.load(0)).toEqual(data00);
            });

            it('can clear the existing cache', function() {
                modelCache.clearAll();
                var count = 0;
                for (var k in modelCache.cache) {
                    if (modelCache.hasOwnProperty(k)) {
                        ++count;
                    }
                }
                expect(count).toEqual(0);
            });

            it('throws an exception when invalid state IDs are submitted', function() {
               expect(function() { modelCache.load(10); }).toThrow('Error: Unable to restore state.');
            });
            */
        });
    }
);
