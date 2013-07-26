define(
    ['cajeta', 'jquery'],
    function(Cajeta, $) {
        // First test classes and extend functionality
        return describe('Cajeta StateCache', function() {

            var stateCache = null;
            var data00 = {
            };
            var data01 = {
                one: 'one'
            };
            var data05 = {
                one: 'one',
                two: 'two',
                three: 'three',
                four: 'four',
                five: 'five'
            };

            var data10 = {
                one: 'one',
                two: 'two',
                three: 'three',
                four: 'four',
                five: 'five',
                six: 'six',
                seven: 'seven',
                eight: 'eight',
                nine: 'nine',
                ten: 'ten'
            };
            var data15 = {
                one: 'one',
                two: 'two',
                three: 'three',
                four: 'four',
                five: 'five',
                six: 'six',
                seven: 'seven',
                eight: 'eight',
                nine: 'nine',
                ten: 'ten',
                eleven: 'eleven',
                twelve: 'twelve',
                thirteen: 'thirteen',
                fourteen: 'fourteen',
                fifteen: 'fifteen'
            }

            it('instantiates with no arguments', function() {
                stateCache = new Cajeta.Model.StateCache();
                expect(stateCache).not.toBeNull();
                expect(stateCache.getStateId()).toEqual(0);
                expect(stateCache.keyPeriod).toEqual(10);
            });

            it('stores a state entry and increments the state ID', function() {
                stateCache.add(data00);
                expect(stateCache.getStateId()).toEqual(0);
                expect(stateCache.modelJson).toEqual(JSON.stringify(data00));
            });

            it('stores another state entry and increments the state ID', function() {
                stateCache.add(data01);
                expect(data00).not.toEqual(data01);
                expect(stateCache.getStateId()).toEqual(1);
                expect(stateCache.modelJson).toEqual(JSON.stringify(data01));
            });

            it('retrieves state entries', function() {
                var data = stateCache.load(0);
                expect(data).toEqual(data00);
                var data = stateCache.load(1);
                expect(data).toEqual(data01);
            });

            it('stores many entries', function() {
                var data = {
                    one: 'one'
                };

                data.two = 'two';
                stateCache.add(data);
                data.three = 'three';
                stateCache.add(data);
                data.four = 'four';
                stateCache.add(data);
                data.five = 'five';
                stateCache.add(data);
                data.six= 'six';
                stateCache.add(data);
                data.seven = 'seven';
                stateCache.add(data);
                data.eight = 'eight';
                stateCache.add(data);
                data.nine = 'nine';
                stateCache.add(data);
                data.ten = 'ten';
                stateCache.add(data);
                data.eleven = 'eleven';
                stateCache.add(data);
                data.twelve = 'twelve';
                stateCache.add(data);
                data.thirteen = 'thirteen';
                stateCache.add(data);
                data.fourteen = 'fourteen';
                stateCache.add(data);
                data.fifteen = 'fifteen';
                stateCache.add(data);
                data.sixteen = 'sixteen';
                stateCache.add(data);
                data.seventeen = 'seventeen';
                stateCache.add(data);
                data.eighteen = 'eighteen';
                stateCache.add(data);

                expect(stateCache.stateId).toEqual(18);
            });

            it('stores uncompressed key entries defined by modulus of the index', function() {
                var stateId = 10;
                expect(JSON.parse(stateCache.cache[10])).toEqual(data10);
            });

            it('can restore an arbitrary, non-key entry', function() {
                expect(stateCache.load(5)).toEqual(data05);
                expect(stateCache.load(15)).toEqual(data15);
            });

            it('can restore an arbitrary, key entry', function() {
                expect(stateCache.load(10)).toEqual(data10);
                expect(stateCache.load(0)).toEqual(data00);
            });

            it('can clear the existing cache', function() {
                stateCache.clearAll();
                var count = 0;
                for (var k in stateCache.cache) {
                    if (stateCache.hasOwnProperty(k)) {
                        ++count;
                    }
                }
                expect(count).toEqual(0);
            });

            it('throws an exception when invalid state IDs are submitted', function() {
               expect(function() { stateCache.load(10); }).toThrow('Error: Unable to restore state.');
            });
        });
    }
);
