define(
    ['cajeta', 'jquery'],
    function(Cajeta, $) {
        // First test classes and extend functionality
        return describe('Cajeta.View.Component', function() {

            var modelCache = new Cajeta.Model.ModelCache();

            var component = new Cajeta.View.Component({
                componentId: 'test',
                modelPath: 'testForm.data',
                onModelChanged: function() { }
            });

            it('throws an exception on instantiation without a componentId', function() {
                expect(function() { new Cajeta.View.Component(); }).toThrow('Error: Cajeta.View.Component.componentId must be defined');
            });

//            it('throws an exception when invalid state IDs are submitted', function() {
//               expect(function() { stateCache.load(10); }).toThrow('Error: Unable to restore state');
//            });
        });
    }
);
