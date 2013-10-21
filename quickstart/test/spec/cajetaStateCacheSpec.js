define(
    ['jquery', 'infusion.model', 'ds'],
    function($, infusion, ds) {
        // First test classes and extend functionality
        return describe('infusion.model.State', function() {

            var state = null;
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
                state = new infusion.model.State({
                    applicationId: 'stateCacheSpec'
                });
                expect(state).not.toBeNull();
                expect(state.getStateId()).toEqual(0);
                expect(state.settings.keyPeriod).toEqual(10);
            });

            it('stores a state entry and increments the state ID', function() {
                state.add(data00);
                expect(state.getStateId()).toEqual(0);
                expect(state.modelJson).toEqual(JSON.stringify(data00));
            });

            it('stores another state entry and increments the state ID', function() {
                state.add(data01);
                expect(data00).not.toEqual(data01);
                expect(state.getStateId()).toEqual(1);
                expect(state.modelJson).toEqual(JSON.stringify(data01));
            });

            it('retrieves state entries', function() {
                var data = state.load(0);
                expect(data).toEqual(data00);
                var data = state.load(1);
                expect(data).toEqual(data01);
            });

            it('stores many entries', function() {
                var data = {
                    one: 'one'
                };

                data.two = 'two';
                state.add(data);
                data.three = 'three';
                state.add(data);
                data.four = 'four';
                state.add(data);
                data.five = 'five';
                state.add(data);
                data.six= 'six';
                state.add(data);
                data.seven = 'seven';
                state.add(data);
                data.eight = 'eight';
                state.add(data);
                data.nine = 'nine';
                state.add(data);
                data.ten = 'ten';
                state.add(data);
                data.eleven = 'eleven';
                state.add(data);
                data.twelve = 'twelve';
                state.add(data);
                data.thirteen = 'thirteen';
                state.add(data);
                data.fourteen = 'fourteen';
                state.add(data);
                data.fifteen = 'fifteen';
                state.add(data);
                data.sixteen = 'sixteen';
                state.add(data);
                data.seventeen = 'seventeen';
                state.add(data);
                data.eighteen = 'eighteen';
                state.add(data);
                expect(state.getStateId()).toEqual(18);
            });

            it('can restore an arbitrary, non-key entry', function() {
                expect(state.load(5)).toEqual(data05);
                expect(state.load(15)).toEqual(data15);
            });

            it('can restore an arbitrary, key entry', function() {
                expect(state.load(10)).toEqual(data10);
                expect(state.load(0)).toEqual(data00);
            });

            it('throws an exception when invalid state IDs are submitted', function() {
                expect(function() { state.load(1000); }).toThrow(infusion.ERROR_STATECACHE_LOADFAILURE);
            });
        });
    }
);
